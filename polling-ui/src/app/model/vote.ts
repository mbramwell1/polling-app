export class Vote {
    constructor(public pollId: string, public choice: string, public id?: string, public dateCreated?: string) {}
}