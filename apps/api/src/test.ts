import { Elysia } from 'elysia'

new Elysia().get('/id/*', ({ params }) => params).listen(3000)

console.log('123')
const abc = 123
