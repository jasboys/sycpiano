import { MultiProgressBars } from 'multi-progress-bars';
import ipc from 'node-ipc';

const mpb = new MultiProgressBars({
    initMessage: 'Dev Status',
    border: true,
    anchor: 'bottom',
    persist: true,
})

ipc.config.id = 'status';
ipc.config.retry = 1500;
ipc.config.logger = console.log.bind(console);

ipc.serve(
    () => {
        ipc.server.on(
            'log',
            (data, socket) => {
                ipc.log(`[${socket}]: ${data}`);
            }
        );
        ipc.server.on(
            'update',
            (data: { percentage?: number, message?: string }, socket: string) => {
                if (mpb.getIndex(socket) === undefined) {
                    mpb.addTask(socket, { type: 'percentage' })
                }
                mpb.updateTask(socket, data);
            }
        );
    }
);

ipc.server.start();