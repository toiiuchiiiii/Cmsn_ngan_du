type MessageHandler = (data: unknown) => void

const RECONNECT_BASE = 1000
const RECONNECT_MAX = 30_000
// const HEARTBEAT_INTERVAL = 30_000

class SocketManager {
  private ws: WebSocket | null = null
  private handlers = new Map<string, Set<MessageHandler>>()
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private destroyed = false

  connect() {
    this.destroyed = false
    this.createConnection()
  }

  private createConnection() {
    if (this.destroyed) return

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(
      `${protocol}://${location.host}/ws`,
    )

    ws.onopen = () => {
      this.reconnectAttempt = 0
      this.startHeartbeat()
    }

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const { event: type, payload } = parsed
        const typeHandlers = this.handlers.get(type)
        if (typeHandlers) {
          typeHandlers.forEach((handler) => handler(payload))
        }
        const allHandlers = this.handlers.get('*')
        if (allHandlers) {
          allHandlers.forEach((handler) => handler(parsed))
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      this.stopHeartbeat()
      if (!this.destroyed) {
        this.scheduleReconnect()
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    this.ws = ws
  }

  private scheduleReconnect() {
    if (this.destroyed) return
    const delay = Math.min(
      RECONNECT_BASE * Math.pow(2, this.reconnectAttempt),
      RECONNECT_MAX,
    )
    this.reconnectAttempt++
    this.reconnectTimer = setTimeout(() => this.createConnection(), delay)
  }

  private startHeartbeat() {
    // Backend handles WS-level ping/pong; no app-level heartbeat needed
    this.stopHeartbeat()
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  disconnect() {
    this.destroyed = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.reconnectAttempt = 0
  }

  send(type: string, payload?: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    }
  }

  subscribe(event: string, callback: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(callback)
    return () => {
      this.handlers.get(event)?.delete(callback)
    }
  }
}

export const socketManager = new SocketManager()
