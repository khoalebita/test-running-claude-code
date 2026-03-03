import express from 'express'
import cors from 'cors'
import todosRouter from './routes/todos'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', todosRouter)

app.listen(3001, () => console.log('Server running on :3001'))
