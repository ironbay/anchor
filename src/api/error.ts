type GenericErrorOpts = {
  status: number
  source?: {
    pointer?: string
  }
  code: string
  title?: string
  detail?: string
}

export class GenericError extends Error {
  public opts: GenericErrorOpts
  constructor(opts: GenericErrorOpts) {
    super(opts.detail)
    this.opts = opts
  }
}

export class NotFoundError extends GenericError {
  constructor() {
    super({
      code: "not_found",
      status: 404,
      detail: "This resource was not found",
    })
  }
}

export class NotSupported extends GenericError {
  constructor() {
    super({
      code: "not_supported",
      status: 400,
      detail: "This endpoint is not supported",
    })
  }
}
