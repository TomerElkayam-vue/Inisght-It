import * from 'express'

declare global {
  namespace Express {
    interface Request {
      codeRepositoryCredentials?: any;
      missionManagementCredentials?: any;
    }
  }
}
