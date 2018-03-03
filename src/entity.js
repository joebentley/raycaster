
export class EntityManager {
  constructor() {
    this.entities = {};
  }

  addEntity(entity) {
    if (!entity.hasOwnProperty('id')) {
      throw 'Entity must have id property';
    }

    this.entities[entity.id] = entity;
  }

  getEntity(id) {
    return this.entities[id];
  }

  apply(method) {
    for (let key in this.entities) {
      this.entities[key].apply(method);
    }
  }

  initializeAll() {
    this.apply('initialize');
  }

  updateAll() {
    this.apply('update');
  }
}

export class Entity {
  constructor(id) {
    this.id = id;
    this.position = { x: 0, y: 0 };
    this.facing = 0;
    this.behaviours = {};
  }

  apply(method) {
    for (let key in this.behaviours) {
      const behaviour = this.behaviours[key];
      if (method in behaviour) {
        behaviour[method]();
      }
    }
  }

  initialize() {
    this.apply('initialize');
  }

  update() {
    this.apply('update');
  }

  addBehaviour(behaviour) {
    if (!behaviour.hasOwnProperty('id')) {
      throw 'Behaviour must have id property';
    }

    behaviour.setParent(this);
    this.behaviours[behaviour.id] = behaviour;
  }
}
