// Stands in for the Workers-only `cloudflare:email` module and keeps the constructor arguments.
export class EmailMessage {
  readonly from: string
  readonly to: string
  readonly raw: string

  constructor (from: string, to: string, raw: string) {
    this.from = from
    this.to = to
    this.raw = raw
  }
}
