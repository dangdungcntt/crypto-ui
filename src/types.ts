export type ECItem = {
  name: string,
  bits: number,
  params: {
    ec: CurveParam,
    n: string,
    g: ECPoint,
  },
  __trace: string
}

export type CurveParam = {
  p: string,
  a: string,
  b: string,
}

export type ECPoint = {
  x: string,
  y: string
}
