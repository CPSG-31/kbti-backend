# KBTI Backend
REST API for <a href="https://github.com/CPSG-31/kbti-frontend">KBTI  (Kamus Besar Teknologi Informasi)</a> built with Typescript + AdonisJs 5


## Run Locally

1. Clone the project
    ```bash
      git clone https://link-to-project
    ```

2. Go to the project directory
    ```bash
      cd my-project
    ```

3. Install dependencies
    ```bash
      npm install
    ```

4. Copy `.env.example` to `.env`
   
5. Create a database and set your database config in `.env`
   
6. Run your mysql server

7. Run migration
    ```bash
      node ace migration:run
    ```

8. Run seeder
    ```bash
      node ace db:seed
    ```

9.  Start the server
    ```bash
      npm run start
    ```



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`CORS_ORIGIN='*'`



## Live Demo

[API Documentation](https://kbti-api.herokuapp.com)

## Credit
- Framework : [AdonisJS 5](https://adonisjs.com/) 
- Database	: [MySQL](https://www.mysql.com/)
- API Docs	: [adonis5-swagger](https://github.com/reg2005/adonis5-swagger )
- Linter	  : [ESLint](https://eslint.org/)
