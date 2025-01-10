namespace NodeJS {
    interface ProcessEnv {
        //app
        PORT: number
        
        //database
        DATABASE_URL: string

        //secrets
        REFRESH_TOKEN_SECRET: string
        ACCESS_TOKEN_SECRET: string

        //paths
        IMAGES_PATH: string
    }
}