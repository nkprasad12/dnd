import {server} from '_server/server';

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
}).on('error', (error) => {
  console.log('Error on listen: ', error.message);
});
