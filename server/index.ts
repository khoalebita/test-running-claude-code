import { createApp } from './app.ts'
import db from './db.ts'

createApp(db).listen(3001, () => console.log('Server running on :3001'))
