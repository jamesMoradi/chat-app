import { BadRequestException } from "@nestjs/common"

export const ValidationPipeConfig = () => {
    return {
        whitelist: true,
        transform: true,
        exceptionFactory: (errors) => {
          const formattedErrors = errors.reduce((accumulator, error) => {
            accumulator[error.property] = Object.values(error.constraints).join(', ')
    
            return accumulator
          }, {})
    
          throw new BadRequestException(formattedErrors)
        }
      }
}