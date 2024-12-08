const zmq = require('zeromq');
const randomInt = require('random-int');

const min = parseInt(process.argv[2]);
const max = parseInt(process.argv[3]);

if (isNaN(min) || isNaN(max) || min >= max) {
    console.log("Использование: node client.js <min> <max>");
    process.exit(1);
}

const secretNumber = randomInt(min, max);

(async () => {
    const socket = new zmq.Req();
    await socket.connect("tcp://localhost:5555");

    await socket.send(JSON.stringify({ range: `${min}-${max}` }));

    while (true) {
        const reply = await socket.receive();
        const answerMessage = JSON.parse(reply.toString());

        if (answerMessage.answer !== undefined) {
            const guess = answerMessage.answer;

            if (guess === secretNumber) {
                console.log(`Сервер угадал число: ${guess}! Поздравляем!`);
                break;
            } else if (guess < secretNumber) {
                await socket.send(JSON.stringify({ hint: "больше" }));
            } else {
                await socket.send(JSON.stringify({ hint: "меньше" }));
            }
        }
    }
})();