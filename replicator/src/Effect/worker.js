class Service {
  /**
   * @param {URL} url
   * @returns {Service}
   */
  static spawn(url) {
    // @ts-ignore
    const self = Worker[`@${url.href}`]
    if (self == null) {
      const worker = new Worker(url.href)
      const self = new Service(url, worker, 0)
      // @ts-ignore
      Worker[`@${url.href}`] = self
      return self
    } else {
      return self
    }
  }

  /**
   *
   * @param {URL} url
   * @param {Worker} worker
   * @param {number} requestID
   * @param {Record<string, {resolve(value:any):void, reject(error:Error):void }>} [requests]
   */
  constructor(url, worker, requestID, requests = {}) {
    this.url = url
    this.worker = worker
    this.requestID = requestID
    this.requests = requests
    worker.addEventListener("messageerror", this)
    worker.addEventListener("error", this)
    worker.addEventListener("message", this)
  }

  /**
   * @param {unknown} message
   */
  send(message) {
    this.worker.postMessage([this.requestID++, message])
  }

  /**
   * @param {unknown} message
   * @returns {Promise<unknown>}
   */
  request(message) {
    const id = `@${this.requestID++}`
    return new Promise((resolve, reject) => {
      this.requests[id] = { resolve, reject }
      this.worker.postMessage([id, message])
    })
  }

  /**
   * @param {MessageEvent} event
   */
  handleEvent(event) {
    switch (event.type) {
      case "error":
      case "messageerror": {
        // @ts-ignore
        return this.kill(event)
      }
      case "message": {
        this.receive(event.data)
      }
    }
  }
  /**
   *
   * @param {Error} [reason]
   */
  kill(reason = new Error("Kill")) {
    const { url, worker, requests } = this
    // @ts-ignore
    delete Worker[url.href]
    worker.terminate()
    for (const request of Object.values(requests)) {
      request.reject(reason)
    }
  }

  /**
   * @param {unknown} data
   */
  receive(data) {
    const { requests } = this
    const [id, payload] = Array.isArray(data) ? data : []
    const request = requests[id]
    if (request == null) {
      throw Error(`Invalid message was received from worker`)
    } else {
      delete requests[id]
      request.resolve(payload)
    }
  }
}

/**
 * @param {URL} url
 */
export const spawn = (url) => async () => Service.spawn(url)

/**
 * @param {URL} url
 */
export const kill = (url) => async () => {
  // @ts-ignore
  const service = Worker[`@${url.href}`]
  if (service) {
    service.kill()
  }
}

/**
 * @param {URL} url
 * @param {unknown} message
 */
export const send = (url, message) => async () =>
  Service.spawn(url).send(message)

/**
 * @param {URL} url
 * @param {unknown} message
 */
export const request = (url, message) => Service.spawn(url).request(message)
