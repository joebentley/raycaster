
/**
 * Keeps track of unique entity instances by unique `id` properties
 * 
 * @export
 * @class EntityManager
 */
export class EntityManager {
  constructor() {
    this.entities = {};
  }

  /**
   * Register an entity to the EntityManager
   * 
   * @param {Entity} entity 
   * @memberof EntityManager
   */
  addEntity(entity) {
    if (!entity.hasOwnProperty('id')) {
      throw 'Entity must have id property';
    }

    this.entities[entity.id] = entity;
  }

  getEntity(id) {
    return this.entities[id];
  }

  /**
   * Call `method` on every registered behaviour of every registered entity
   * provided it has a property named `method`
   * 
   * @param {string} method 
   * @memberof EntityManager
   */
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
    this.behaviours = [];
  }

  /**
   * Call `method` on every registered behaviour
   * 
   * @param {string} method 
   * @memberof Entity
   */
  apply(method) {
    this.behaviours.map((behaviour) => behaviour.apply(method));
  }

  initialize() {
    this.apply('initialize');
  }

  update() {
    this.apply('update');
  }

  /**
   * Register a behaviour to this entity
   * 
   * @param {Behaviour} behaviour 
   * @memberof Entity
   */
  addBehaviour(behaviour) {
    behaviour.setParent(this);
    this.behaviours.push(behaviour);
  }
}
