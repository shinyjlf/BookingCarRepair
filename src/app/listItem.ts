export class ListItem {

  constructor(idVal: string, nameVal: string = "") {
    this.id = idVal;
    this.name = nameVal;
  }

  id: string;
  name: string;
}
