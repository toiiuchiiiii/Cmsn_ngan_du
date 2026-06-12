export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at?: string
}

export interface ApiError {
  error: string
}

export interface DiaryEntry {
  id: number
  user_id: number
  content: string
  mood: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface TestResult {
  id: number
  user_id: number
  test_type: string
  score: number
  severity: string
  result: string
  answers: number[]
  created_at: string
}

export interface TestType {
  id: string
  name: string
  description: string
  time: string
  questions: string[]
  options: TestOption[]
  severityLevels: SeverityLevel[]
}

export interface TestOption {
  label: string
  value: number
}

export interface SeverityLevel {
  min: number
  max: number
  label: string
  description: string
  recommendation: string
  color: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Appointment {
  id: number
  user_id: number
  therapist_id: number
  therapist_name: string
  date_time: string
  notes?: string
  status: AppointmentStatus
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  user_id: number
  title: string
  content: string
  is_anonymous: boolean
  like_count: number
  comment_count: number
  created_at: string
  author?: User
}

export interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  created_at: string
  author?: User
}

export interface Conversation {
  id: number
  created_at: string
  updated_at: string
  participants: User[]
  last_message?: Message
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  text: string
  is_read: boolean
  created_at: string
  sender?: User
}

export interface Contact extends User {
  is_online: boolean
  last_seen?: string
}

export interface QuickAction {
  id: string
  label: string
  icon: string
}

export interface AgentMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: number
}

export interface BotReply {
  keyword: string
  response: string
}
