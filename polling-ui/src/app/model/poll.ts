export class Poll {
  id: string;
  name: string;
  active: boolean;
  options: Map<string, number>;
  votePlaced: string | null;
  dateCreated: string;

  constructor(newItem: any) {
    this.id = newItem.id;
    this.name = newItem.name;
    this.active = newItem.active;
    this.options = new Map(Object.entries(newItem.options));
    this.votePlaced = newItem.votePlaced;
    this.dateCreated = newItem.dateCreated;
  }

  getVotesSum(): number {
    return Array.from(this.options.values()).reduce((acc, val) => acc + val, 0);
  }
}
