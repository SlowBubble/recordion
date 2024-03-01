

export class UndoMgr<S> {
  private statesForUndo: S[] = [];
  private statesForRedo: S[] = [];

  constructor(private currState: S, private equalFunc: (a: S, b: S) => boolean) {
  }

  recordCurrState(newCurrState: S) {
    if (this.equalFunc(this.currState, newCurrState)) {
      return;
    }
    this.statesForUndo.push(this.currState);
    this.currState = newCurrState;
    this.statesForRedo = [];
  }
  undo() {
    const previousState = this.statesForUndo.pop();
    if (!previousState) {
      return;
    }
    this.statesForRedo.push(this.currState);
    this.currState = previousState;
    return this.currState;
  }
  redo() {
    const nextState = this.statesForRedo.pop();
    if (!nextState) {
      return;
    }
    this.statesForUndo.push(this.currState);
    this.currState = nextState;
    return this.currState;
  }
}
  
