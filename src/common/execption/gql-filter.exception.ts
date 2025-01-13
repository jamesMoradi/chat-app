import { ApolloError } from 'apollo-server-express'
import { ArgumentsHost, Catch, BadRequestException } from '@nestjs/common'
import { GqlExceptionFilter } from '@nestjs/graphql'

@Catch(BadRequestException)
export class GQLErrorFilter implements GqlExceptionFilter {
    catch(exception: BadRequestException) {
            const response = exception.getResponse()

            if (typeof response === 'object') {
                throw new ApolloError('validation error', 'VALIDATION_ERROR', response)
            } else {
                throw new ApolloError('Bad Request')
            }
    }
}