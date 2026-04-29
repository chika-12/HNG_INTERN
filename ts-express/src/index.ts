import express from 'express';
import { Request, Response } from 'express';
const app = express();
const PORT = 3000;

app.get('/users', (req: Request, res: Response) => {
  res.json({ message: 'Hello Chika' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
