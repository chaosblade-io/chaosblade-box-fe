export interface IPreCheckInfo {
  opLevel: number;
  points: IPoint[];
}

export interface IPoint {
  opLevel: number;
  type: number;
  results: IResult[];
}

export interface IResult {
  groupId: string;
  ip: string;
  passed: boolean;
  content?: string;
}
