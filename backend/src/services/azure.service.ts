import axios from 'axios'
import { env } from '../config/env'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface WorkItem {
    id: number
    url: string
    fields: {
        'System.Title': string
        'System.WorkItemType': string
        'System.State': string
        'System.AssignedTo'?: { displayName: string; uniqueName: string } | string
        'System.AreaPath': string
        'System.IterationPath': string
    }
}

export interface WorkItemSummary {
    id: number
    title: string
    type: string
    state: string
    assignedTo: string
    areaPath: string
    iterationPath: string
    url: string
}

export interface CreateBugParams {
    title: string
    description: string
    expectedResult: string
    severity: string
    stepIdentification: string
    aiAccelerated: string
    aiTypeOfAssistance: string
    aiStageUsed: string
    aiTool: string
    aiToolOther: string
    parentItem: WorkItem
}

// ─── Cliente HTTP configurado ─────────────────────────────────────────────────

const azureClient = axios.create({
    baseURL: `https://dev.azure.com/${env.AZURE_ORGANIZATION}/${env.AZURE_PROJECT}/_apis`,
    headers: {
        Authorization: `Basic ${Buffer.from(`:${env.AZURE_PAT}`).toString('base64')}`,
        'Content-Type': 'application/json',
    },
    timeout: 15000,
})

// ─── Buscar work item por ID ──────────────────────────────────────────────────

export async function getWorkItem(id: number): Promise<WorkItemSummary> {
    try {
        const { data } = await azureClient.get<WorkItem>(
            `/wit/workitems/${id}?api-version=7.0`
        )

        const assignedTo = data.fields['System.AssignedTo']
        const assignedToName =
            typeof assignedTo === 'object' && assignedTo?.displayName
                ? assignedTo.displayName
                : typeof assignedTo === 'string'
                    ? assignedTo
                    : 'Não atribuído'

        return {
            id: data.id,
            title: data.fields['System.Title'],
            type: data.fields['System.WorkItemType'],
            state: data.fields['System.State'],
            assignedTo: assignedToName,
            areaPath: data.fields['System.AreaPath'],
            iterationPath: data.fields['System.IterationPath'],
            url: data.url,
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error(`Item #${id} não encontrado no Azure DevOps.`)
            }
            if (error.response?.status === 401) {
                throw new Error('Token de autenticação inválido ou expirado.')
            }
            throw new Error(`Erro ao buscar item: ${error.response?.statusText ?? error.message}`)
        }
        throw error
    }
}

// ─── Criar bug vinculado ao item pai ─────────────────────────────────────────

export async function createBug(params: CreateBugParams, parentItem: WorkItem): Promise<{ id: number; url: string }> {
    const descriptionHtml = params.description.replace(/\n/g, '<br>')

    const payload = [
        { op: 'add', path: '/fields/System.Title', value: params.title },
        { op: 'add', path: '/fields/System.AreaPath', value: parentItem.fields['System.AreaPath'] },
        { op: 'add', path: '/fields/System.IterationPath', value: parentItem.fields['System.IterationPath'] },
        { op: 'add', path: '/fields/System.State', value: 'New' },
        { op: 'add', path: '/fields/Microsoft.VSTS.TCM.ReproSteps', value: `<div>${descriptionHtml}</div>` },
        { op: 'add', path: '/fields/Custom.Standard_Bug_Expected_Result', value: params.expectedResult },
        { op: 'add', path: '/fields/Custom.Standard_Step_Identified', value: params.stepIdentification },
        { op: 'add', path: '/fields/Custom.Standard_Bug_Severity', value: params.severity },
        { op: 'add', path: '/fields/Custom.Standard_AI_Accelerated', value: params.aiAccelerated },
        { op: 'add', path: '/fields/Custom.Standard_AI_Type_of_Assistance', value: params.aiTypeOfAssistance },
        { op: 'add', path: '/fields/Custom.Standard_AI_Stage_Used', value: params.aiStageUsed },
        { op: 'add', path: '/fields/Custom.Standard_AI_Tool', value: params.aiTool },
        { op: 'add', path: '/fields/Custom.Standard_AI_Tool_Other', value: params.aiToolOther },
        {
            op: 'add',
            path: '/relations/-',
            value: {
                rel: 'System.LinkTypes.Hierarchy-Reverse',
                url: parentItem.url,
                attributes: { comment: 'Bug encontrado durante testes' },
            },
        },
    ]

    try {
        const { data } = await azureClient.post(
            `/wit/workitems/$Bug?api-version=7.0`,
            payload,
            { headers: { 'Content-Type': 'application/json-patch+json' } }
        )

        return {
            id: data.id,
            url: `https://dev.azure.com/${env.AZURE_ORGANIZATION}/${env.AZURE_PROJECT}/_workitems/edit/${data.id}`,
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message ?? error.message
            throw new Error(`Erro ao criar bug no Azure DevOps: ${message}`)
        }
        throw error
    }
}

// ─── Contar bugs criados por IA nos últimos 90 dias via WIQL ─────────────────

export async function queryAIBugsCount(): Promise<number> {
    const wiqlPayload = {
        query: `
            SELECT [System.Id]
            FROM workitems
            WHERE
                [System.TeamProject] = '${env.AZURE_PROJECT}'
                AND [System.CreatedDate] >= @StartOfYear
                AND [System.WorkItemType] = 'Bug'
                AND [Custom.Standard_AI_Tool] = 'Other'
                AND [Custom.Standard_AI_Tool_Other] = 'Other'
        `,
    }

    try {
        const { data } = await azureClient.post<{
            workItems: { id: number }[]
        }>('/wit/wiql?api-version=7.0', wiqlPayload)

        return data.workItems?.length ?? 0
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Erro ao buscar estatísticas: ${error.response?.data?.message ?? error.message}`)
        }
        throw error
    }
}