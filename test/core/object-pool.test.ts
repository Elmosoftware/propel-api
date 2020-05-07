import { ObjectPool, ObjectPoolOptions, Resettable } from "../../core/object-pool";

let counter: number = 0;

class TestPool implements Resettable {

    constructor() {
        counter++;
    }

    reset() {
    }
}

describe("ObjectPool Class - Constructor", () => {
    test(`new ObjectPool without create instance callback must throw.`, () => {
        expect(() => {
            let pool: ObjectPool<TestPool>;
            counter = 0;
            //@ts-ignore
            pool = new ObjectPool<TestPool>()
        }).toThrow(`The parameter "createInstanceCallback" is required and must be a callback function.`);
    })
    test(`new ObjectPool with callback and no options.`, () => {

        let preAlloc: number = Math.round(ObjectPoolOptions.DEFAULT_MAX_SIZE * ObjectPoolOptions.DEFAULT_PREALLOCATED_PERC);
        let pool: ObjectPool<TestPool>;
        counter = 0;

        pool = new ObjectPool<TestPool>(() => new TestPool())

        expect(pool.options.maxQueueSize).toEqual(ObjectPoolOptions.DEfAULT_MAX_QUEUE_SIZE);
        expect(pool.options.maxSize).toEqual(ObjectPoolOptions.DEFAULT_MAX_SIZE);
        expect(pool.options.preallocatedSize).toEqual(preAlloc);

        expect(pool.canGrow).toBe(true);
        expect(pool.availableToGrow).toEqual(ObjectPoolOptions.DEFAULT_MAX_SIZE - preAlloc);
        expect(pool.availableCount).toEqual(preAlloc);
        expect(pool.lockedCount).toEqual(0);
        expect(pool.createdCount).toEqual(preAlloc);
    })
    test(`new ObjectPool with maxSize = 0 need to be DEFAULT_MAX_SIZE.`, () => {
        let pool: ObjectPool<TestPool>;
        counter = 0;
        //@ts-ignore
        pool = new ObjectPool<TestPool>(() => new TestPool(), { maxSize: 0 })

        expect(pool.options.maxSize).toEqual(ObjectPoolOptions.DEFAULT_MAX_SIZE);
    })
    test(`new ObjectPool with preallocatedSize greater than maxSize need to be default preallocated value.`, () => {
        let preAlloc: number = Math.round(ObjectPoolOptions.DEFAULT_MAX_SIZE * ObjectPoolOptions.DEFAULT_PREALLOCATED_PERC);
        let pool: ObjectPool<TestPool>;
        counter = 0;
        //@ts-ignore
        pool = new ObjectPool<TestPool>(() => new TestPool(),
            //@ts-ignore
            { preallocatedSize: ObjectPoolOptions.DEFAULT_MAX_SIZE + 1 })

        expect(pool.options.preallocatedSize).toEqual(preAlloc);
    })
    test(`new ObjectPool with negative maxQueueSize need to be default queue size.`, () => {
        let pool: ObjectPool<TestPool>;
        counter = 0;
        //@ts-ignore
        pool = new ObjectPool<TestPool>(() => new TestPool(),
            //@ts-ignore
            { maxQueueSize: -45 })

        expect(pool.options.maxQueueSize).toEqual(ObjectPoolOptions.DEfAULT_MAX_QUEUE_SIZE);
    })
    test(`new ObjectPool with maxSize = 10, preallocated = 0`, () => {
        let pool: ObjectPool<TestPool>;
        counter = 0;
        pool = new ObjectPool<TestPool>(() => new TestPool(),
            //@ts-ignore
            { maxSize: 10, preallocatedSize: 0 })

        expect(pool.canGrow).toBe(true);
        expect(pool.availableToGrow).toEqual(10);
        expect(pool.availableCount).toEqual(0);
        expect(pool.lockedCount).toEqual(0);
        expect(pool.createdCount).toEqual(0);
    })
    test(`new ObjectPool with maxSize = 10, preallocated = 3`, () => {
        let pool: ObjectPool<TestPool>;
        counter = 0;
        pool = new ObjectPool<TestPool>(() => new TestPool(),
            //@ts-ignore
            { maxSize: 10, preallocatedSize: 3 })

        expect(pool.canGrow).toBe(true);
        expect(pool.availableToGrow).toEqual(7);
        expect(pool.availableCount).toEqual(3);
        expect(pool.lockedCount).toEqual(0);
        expect(pool.createdCount).toEqual(3);
    })
    test(`new ObjectPool with maxQueueSize = 0 is allowed`, () => {
        let pool: ObjectPool<TestPool>;
        counter = 0;
        pool = new ObjectPool<TestPool>(() => new TestPool(),
            //@ts-ignore
            { maxQueueSize: 0 })

        expect(pool.remainingQueueSpace).toEqual(0);
    })
    test(`new ObjectPool with invalid maxQueueSize = 0 is converted to the default queue size value`, () => {
        let pool: ObjectPool<TestPool>;
        counter = 0;
        pool = new ObjectPool<TestPool>(() => new TestPool(),
            //@ts-ignore
            { maxQueueSize: -1 })

        expect(pool.remainingQueueSpace).toEqual(ObjectPoolOptions.DEfAULT_MAX_QUEUE_SIZE);
    })
});

describe("ObjectPool Class - Usage", () => {

    let pool: ObjectPool<TestPool>;

    beforeEach(() => {
        counter = 0;

        let op = new ObjectPoolOptions();
        op.maxSize = 3
        op.preallocatedSize = 1
        op.maxQueueSize = 1

        pool = new ObjectPool<TestPool>(() => new TestPool(), op);
    })
    test(`aquiring one and releasing one"`, (done) => {
        pool.aquire().then((o: TestPool) => {
            expect(pool.availableCount).toEqual(0)
            expect(pool.lockedCount).toEqual(1)
            expect(pool.availableToGrow).toEqual(2)
            expect(pool.createdCount).toEqual(1)

            pool.release(o);

            expect(pool.availableCount).toEqual(1)
            expect(pool.lockedCount).toEqual(0)
            expect(pool.availableToGrow).toEqual(2)
            expect(pool.createdCount).toEqual(1)

            done();
        })
    })
    test(`aquiring the max plus one queued then releasing"`, (done) => {
        let myPool: TestPool[] = []

        //Aquiring 1st:
        console.log(`Aquiring 1st. (In use: ${myPool.length}`)
        pool.aquire().then((o: TestPool) => {
            console.log(`Getting 1st. (In use: ${myPool.length}`)
            myPool.push(o);
            expect(pool.availableCount).toEqual(0)
            expect(pool.lockedCount).toEqual(1)
            expect(pool.availableToGrow).toEqual(2)
            expect(pool.createdCount).toEqual(1)

            //aquiring 2nd:
            console.log(`Aquiring 2nd. (In use: ${myPool.length}`)
            pool.aquire().then((o: TestPool) => {
                console.log(`Getting 2nd. (In use: ${myPool.length}`)
                myPool.push(o);
                expect(pool.availableCount).toEqual(0)
                expect(pool.lockedCount).toEqual(2)
                expect(pool.availableToGrow).toEqual(1)
                expect(pool.createdCount).toEqual(2)

                //aquiring 3rd:
                console.log(`Aquiring 3rd. (In use: ${myPool.length}`)
                pool.aquire().then((o: TestPool) => {
                    console.log(`Getting 3rd. (In use: ${myPool.length}`)
                    myPool.push(o);
                    expect(pool.availableCount).toEqual(0)
                    expect(pool.lockedCount).toEqual(3)
                    expect(pool.availableToGrow).toEqual(0)
                    expect(pool.createdCount).toEqual(3)

                    //In 2sec we will start releasing:
                    setTimeout(() => {
                        //Start releasing:
                        myPool.forEach((item) => {
                            pool.release(item);
                        })
                        myPool = [];
                    }, 1000)

                    //First and only queued!!!
                    console.log(`Aquiring 4th. (In use: ${myPool.length}`)
                    pool.aquire().then((o: TestPool) => {
                        console.log(`Getting 4th!!!!`)
                        expect(pool.availableCount).toBeGreaterThan(0);
                        expect(pool.lockedCount).toBeGreaterThan(0);
                        expect(pool.availableToGrow).toEqual(0)
                        expect(pool.createdCount).toEqual(3)
                        done();
                    });
                });
            });
        });
    },10000);
    test(`Queue overflow exception"`, (done) => {
        let myPool: TestPool[] = []

        //Aquiring 1st:
        console.log(`Aquiring 1st. (In use: ${myPool.length}`)
        pool.aquire().then((o: TestPool) => {
            console.log(`Getting 1st. (In use: ${myPool.length}`)
            myPool.push(o);

            //aquiring 2nd:
            console.log(`Aquiring 2nd. (In use: ${myPool.length}`)
            pool.aquire().then((o: TestPool) => {
                console.log(`Getting 2nd. (In use: ${myPool.length}`)
                myPool.push(o);

                //aquiring 3rd:
                console.log(`Aquiring 3rd. (In use: ${myPool.length}`)
                pool.aquire().then((o: TestPool) => {
                    console.log(`Getting 3rd. (In use: ${myPool.length}`)
                    myPool.push(o);

                    //First and only queued!!!
                    console.log(`Aquiring 4th. (In use: ${myPool.length}`)
                    pool.aquire().then((o: TestPool) => {
                        console.log(`Getting 4th!!!!  (This will never happen!!!)`)
                    });

                    //Queue OVERFLOW!!!
                    console.log(`Aquiring 5th. (In use: ${myPool.length}`)
                    pool.aquire()
                        .then((o: TestPool) => {
                            console.log(`Getting 5th!!!! (This will never happen!!!)`);
                        })
                        .catch((err) => {
                            console.error(`ERROR!!!!: ${err}`)
                            expect(err.message).toContain(`ObjectPool memory queue overflow`);
                            done();
                        });
                });
            });
        });
    },10000);
});