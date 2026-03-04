import { useContext } from 'react'
import { ThemeContext } from '../store/ThemeContext'

export const useTheme = () => useContext(ThemeContext)