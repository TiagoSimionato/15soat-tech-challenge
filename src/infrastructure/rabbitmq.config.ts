import * as amqp from 'amqplib';

export const STATUS_EVENT_PATTERN = 'requested-service.status';

export const STATUS_DLX = 'status.dlx';
export const STATUS_DLQ = 'status.dead';
export const STATUS_DLQ_ROUTING_KEY = 'status.dead';

export const STATUS_QUEUE_OPTIONS = {
  arguments: {
    'x-dead-letter-exchange': STATUS_DLX,
    'x-dead-letter-routing-key': STATUS_DLQ_ROUTING_KEY,
    'x-delivery-limit': 5,
    'x-queue-type': 'quorum',
  },
  durable: true,
};

export const setupDeadLetterTopology = async (url: string): Promise<void> => {
  const connection = await amqp.connect(url);
  try {
    const channel = await connection.createChannel();
    await channel.assertExchange(STATUS_DLX, 'direct', { durable: true });
    await channel.assertQueue(STATUS_DLQ, { durable: true });
    await channel.bindQueue(STATUS_DLQ, STATUS_DLX, STATUS_DLQ_ROUTING_KEY);
    await channel.close();
  }
  finally {
    await connection.close();
  }
};
