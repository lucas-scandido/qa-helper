import type { FastifyReply } from 'fastify'
import { getWorkItem, createBug, queryAIBugsCount, invalidateStatsCache } from '../services/azure.service'
import { generateBugWithAI, formatGeneratedBug } from '../services/ai.service'
import { buildSystemPrompt, buildUserPrompt } from '../prompts/bug.prompt'
import { identifyProductByAreaPath, buildProductContext } from '../products'
import type { GenerateBugInput, CreateBugInput } from '../schemas/bug.schema'

// ─── Helpers de mapeamento por estado ────────────────────────────────────────

function resolveAiStageUsed(state: string): '1. Development' | '2. Code Review' | '3. Tests' {
    if (state === 'Development') return '1. Development'
    if (state === 'Review') return '2. Code Review'
    return '3. Tests'
}

function resolveTestEnvironment(state: string): string {
    if (['Development', 'Review'].includes(state)) return 'Dev'
    if (['Quality Analysis'].includes(state)) return 'Stg'
    if (['Validation', 'In Production'].includes(state)) return 'Prd'
    return 'Dev'
}

// ─── GET /api/bugs/search/:id ─────────────────────────────────────────────────

export async function searchItem(id: number, reply: FastifyReply) {
    const item = await getWorkItem(id)
    const product = identifyProductByAreaPath(item.areaPath)
    return reply.send({
        success: true,
        data: {
            ...item,
            hasProductContext: product !== null,
            product: product ?? null,
        },
    })
}

// ─── POST /api/bugs/generate ──────────────────────────────────────────────────

export async function generateBug(input: GenerateBugInput, reply: FastifyReply) {
    const { description, workItemId } = input

    const workItem = await getWorkItem(workItemId)
    const product = identifyProductByAreaPath(workItem.areaPath)

    if (!product) {
        return reply.status(400).send({
            success: false,
            error: `Produto não identificado para o Area Path: "${workItem.areaPath}"`,
        })
    }

    const productContext = buildProductContext(product)

    reply.log.info({ product: product.nome, areaPath: workItem.areaPath }, 'Produto identificado')

    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildUserPrompt({
        workItemId: workItem.id,
        workItemType: workItem.type,
        workItemTitle: workItem.title,
        workItemState: workItem.state,
        workItemDescription: workItem.description,
        workItemObjective: workItem.objective,
        workItemBusinessAC: workItem.businessAcceptanceCriteria,
        workItemTechnicalAC: workItem.technicalAcceptanceCriteria,
        workItemAC: workItem.acceptanceCriteria,
        workItemDoD: workItem.definitionOfDone,
        testEnvironment: resolveTestEnvironment(workItem.state),
        description,
        product,
        productContext,
    })

    // [DEBUG] Inspecionar contexto do work item e prompt antes de chamar a IA
    reply.log.info({
        workItemContext: {
            id: workItem.id,
            type: workItem.type,
            title: workItem.title,
            description: workItem.description,
            objective: workItem.objective,
            businessAcceptanceCriteria: workItem.businessAcceptanceCriteria,
            technicalAcceptanceCriteria: workItem.technicalAcceptanceCriteria,
            acceptanceCriteria: workItem.acceptanceCriteria,
            definitionOfDone: workItem.definitionOfDone,
        },
    }, '[DEBUG] Campos do work item recebidos')

    reply.log.info({ userPrompt }, '[DEBUG] Prompt enviado para a IA')

    const generated = await generateBugWithAI(systemPrompt, userPrompt, reply.log)
    const formatted = formatGeneratedBug(generated)

    return reply.send({ success: true, product: product.nome, data: formatted })
}

// ─── POST /api/bugs/create ────────────────────────────────────────────────────

export async function createBugHandler(input: CreateBugInput, reply: FastifyReply) {
    const { workItemId, title, description, expectedResult, severity, stepIdentification } = input

    const workItemSummary = await getWorkItem(workItemId)

    const parentItem = {
        id: workItemSummary.id,
        url: workItemSummary.url,
        fields: {
            'System.Title': workItemSummary.title,
            'System.WorkItemType': workItemSummary.type,
            'System.State': workItemSummary.state,
            'System.AreaPath': workItemSummary.areaPath,
            'System.IterationPath': workItemSummary.iterationPath,
        },
    }

    const created = await createBug(
        {
            title,
            description,
            expectedResult,
            severity,
            stepIdentification,
            aiAccelerated: 'Yes',
            aiTypeOfAssistance: 'Tests',
            aiStageUsed: resolveAiStageUsed(workItemSummary.state),
            aiTool: 'Other',
            aiToolOther: 'Other',
        },
        parentItem
    )

    invalidateStatsCache()
    return reply.status(201).send({ success: true, data: created })
}

// ─── GET /api/bugs/stats ──────────────────────────────────────────────────────

export async function getBugStatsHandler(reply: FastifyReply) {
    const total = await queryAIBugsCount()
    return reply.send({ success: true, data: { total } })
}
