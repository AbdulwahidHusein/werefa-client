export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

export class WsClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxRetries = 4;
  private backoffTimes = [1000, 2000, 4000, 8000];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<(event: any) => void>();
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private state: ConnectionState = "disconnected";

  constructor(url: string) {
    this.url = url;
  }

  public connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

    this.setState("connecting");
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setState("connected");
    };

    this.ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        this.listeners.forEach((l) => l(data));
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (this.state !== "disconnected") {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws = null;
      if (this.state !== "disconnected") {
        this.scheduleReconnect();
      }
    };
  }

  public disconnect() {
    this.setState("disconnected");
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect() {
    this.setState("error");
    if (this.reconnectAttempts >= this.maxRetries) {
      this.setState("disconnected"); // Max retries reached
      return;
    }

    const delay = this.backoffTimes[this.reconnectAttempts];
    this.reconnectAttempts++;
    this.timer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setState(newState: ConnectionState) {
    this.state = newState;
    this.stateListeners.forEach((l) => l(newState));
  }

  public onMessage(listener: (event: any) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onStateChange(listener: (state: ConnectionState) => void) {
    this.stateListeners.add(listener);
    // Emit current state immediately
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }
}
