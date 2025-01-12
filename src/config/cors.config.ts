export const CorsConfig = () => {
    const {ORIGIN} = process.env
    return {
        origin: ORIGIN,
        allowedHeaders: [
            'Accept',
            'Authorization',
            'Content-Type',
            'X-Requested-With',
            'apollo-require-preflight'
        ],
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
      }
}