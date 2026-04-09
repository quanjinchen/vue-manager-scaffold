type PollingOptions = {
  interval: number;
  maxAttempts?: number;
};

type PollingCallbacks = {
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onExecute?: (attempt: number) => void;
};

export class Polling {
  private intervalId: number | null = null;
  private attempts = 0;

  constructor(
    private readonly options: PollingOptions,
    private readonly callbacks: PollingCallbacks = {}
  ) {}

  start() {
    if (this.intervalId !== null) {
      return;
    }
    this.attempts = 0;
    this.callbacks.onStart?.();
    this.execute();
    this.intervalId = window.setInterval(() => {
      this.execute();
    }, this.options.interval);
  }

  stop() {
    if (this.intervalId === null) {
      return;
    }
    window.clearInterval(this.intervalId);
    this.intervalId = null;
    this.callbacks.onStop?.();
  }

  restart() {
    this.stop();
    this.callbacks.onRestart?.();
    this.start();
  }

  private execute() {
    this.attempts += 1;
    this.callbacks.onExecute?.(this.attempts);
    if (this.options.maxAttempts && this.attempts >= this.options.maxAttempts) {
      this.stop();
    }
  }
}

