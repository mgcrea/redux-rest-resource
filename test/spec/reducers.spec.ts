import expect from 'expect';
import {values, snakeCase} from 'lodash';

import {defaultActions, defaultState, initialState as defaultInitialState} from '../../src/defaults';
import {createTypes, getActionTypeKey} from '../../src/types';
import {createRootReducer, createReducers} from '../../src/reducers';
import {combineReducers} from '../../src/reducers/helpers';
import {parseContentRangeHeader} from '../../src/helpers/util';
import {State} from '../../src';

// Configuration
type User = {id: number; firstName: string};
const resourceName = 'user';
const initialState = {} as State<User>;

describe('createReducers', () => {
  it('should return a reduce function', () => {
    const reducers = createReducers<User>(defaultActions, {});
    expect(typeof reducers).toBe('object');
    const expectedValuesFn = (reducer) => expect(typeof reducer).toBe('function');
    values(reducers).forEach(expectedValuesFn);
  });
  it('should return a reduce function', () => {
    const reducers = createReducers<User>(defaultActions, {});
    const rootReducer = createRootReducer<User>(reducers, {
      resourceName
    });
    expect(typeof rootReducer).toBe('function');
  });
  it('should return the initial state', () => {
    const reducers = createReducers<User>(defaultActions, {});
    const rootReducer = createRootReducer<User>(reducers, {
      resourceName
    });
    expect(rootReducer(undefined, {})).toEqual(defaultInitialState);
  });
});

describe('defaultReducers', () => {
  const types = createTypes(defaultActions, {
    resourceName
  });
  const reducers = createReducers<User>(defaultActions, {});
  it('should handle CREATE action', () => {
    const actionId = 'create';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const context = {
      firstName: 'Olivier'
    };
    let status;

    status = 'pending';
    const pendingAction = {
      type,
      status,
      context,
      options: {
        assignResponse: true
      }
    };
    const pendingState = reducers[actionId](initialState, pendingAction);
    expect(pendingState).toEqual({
      isCreating: true
    });

    status = 'resolved';
    const body = {
      id: 1,
      firstName: 'Olivier'
    };
    const receivedAt = Date.now();
    const resolvedAction = {
      type,
      status,
      context,
      payload: {
        body,
        receivedAt
      },
      options: {
        assignResponse: true
      }
    };
    expect(reducers[actionId](pendingState, resolvedAction)).toEqual({
      isCreating: false,
      items: [body]
    });

    status = 'rejected';
    const rejectedAction = {
      type,
      status,
      context,
      payload: {
        receivedAt
      },
      options: {}
    };
    expect(reducers[actionId](pendingState, rejectedAction)).toEqual({
      isCreating: false
    });
  });
  it('should handle FETCH action (classic fetch)', () => {
    const actionId = 'fetch';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](initialState, {
      type,
      status,
      options: {},
      context: {}
    });
    expect(pendingState).toEqual({
      isFetching: true,
      didInvalidate: false
    });

    status = 'resolved';
    const code = 200;
    const body = [
      {
        id: 1,
        firstName: 'Olivier'
      }
    ];
    const receivedAt = Date.now();
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        payload: {
          body,
          receivedAt,
          code
        },
        options: {},
        context: {}
      })
    ).toEqual({
      isFetching: false,
      didInvalidate: false,
      items: body,
      lastUpdated: receivedAt
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        payload: {
          receivedAt
        },
        options: {},
        context: {}
      })
    ).toEqual({
      didInvalidate: false,
      isFetching: false
    });
  });
  describe('should handle FETCH action with Content-Range header', () => {
    it('partial-content fetch => first range [0 to 2]', () => {
      const actionId = 'fetch';
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](
        {...defaultState.fetch},
        {
          type,
          status
        }
      );
      expect(pendingState).toEqual({
        isFetching: true,
        didInvalidate: false,
        items: [],
        lastUpdated: 0
      });

      status = 'resolved';
      const code = 206;
      const contentRange = parseContentRangeHeader('users 0-2/3');
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        },
        {
          id: 2,
          firstName: 'Romain'
        },
        {
          id: 3,
          firstName: 'someone'
        }
      ];
      const receivedAt = Date.now();
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            body,
            receivedAt,
            contentRange,
            code
          },
          context: {},
          options: {}
        })
      ).toEqual({
        isFetching: false,
        didInvalidate: false,
        items: body,
        lastUpdated: receivedAt
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            receivedAt
          },
          context: {},
          options: {}
        })
      ).toEqual({
        didInvalidate: false,
        isFetching: false,
        items: [],
        lastUpdated: 0
      });
    });
    it('partial-content fetch => first range [0 to 2] with 3 old items', () => {
      const actionId = 'fetch';
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];
      const oldItems: User[] = [
        {
          id: 1,
          firstName: 'Olivier'
        },
        {
          id: 2,
          firstName: 'Romain'
        },
        {
          id: 3,
          firstName: 'someone'
        }
      ];
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](
        {
          items: oldItems
        } as State<User>,
        {
          type,
          status,
          context: {},
          options: {}
        }
      );
      expect(pendingState).toEqual({
        isFetching: true,
        didInvalidate: false,
        items: oldItems
      });

      status = 'resolved';
      const code = 206;
      const contentRange = parseContentRangeHeader('users 0-2/3');
      const body = [
        {
          id: 11,
          firstName: 'Olivier'
        },
        {
          id: 12,
          firstName: 'Romain'
        },
        {
          id: 13,
          firstName: 'someone'
        }
      ];
      const receivedAt = Date.now();
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            body,
            receivedAt,
            contentRange,
            code
          },
          context: {},
          options: {}
        })
      ).toEqual({
        isFetching: false,
        didInvalidate: false,
        items: body,
        lastUpdated: receivedAt
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            receivedAt
          },
          context: {},
          options: {}
        })
      ).toEqual({
        didInvalidate: false,
        isFetching: false,
        items: oldItems
      });
    });
    it('partial-content fetch => next range [3 to 4] with 3 old items', () => {
      const actionId = 'fetch';
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];
      const oldItems: User[] = [
        {
          id: 1,
          firstName: 'Olivier'
        },
        {
          id: 2,
          firstName: 'Romain'
        },
        {
          id: 3,
          firstName: 'someone'
        }
      ];
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](
        {
          items: oldItems
        } as State<User>,
        {
          type,
          status,
          context: {},
          options: {}
        }
      );
      expect(pendingState).toEqual({
        isFetching: true,
        didInvalidate: false,
        items: oldItems
      });

      status = 'resolved';
      const code = 206;
      const contentRange = parseContentRangeHeader('users 3-4/2');
      const body = [
        {
          id: 4,
          firstName: 'somebody'
        },
        {
          id: 5,
          firstName: 'someone else'
        }
      ];
      const receivedAt = Date.now();
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            body,
            receivedAt,
            contentRange,
            code
          },
          context: {},
          options: {}
        })
      ).toEqual({
        isFetching: false,
        didInvalidate: false,
        items: oldItems.concat(body),
        lastUpdated: receivedAt
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            receivedAt
          },
          context: {},
          options: {}
        })
      ).toEqual({
        didInvalidate: false,
        isFetching: false,
        items: oldItems
      });
    });
    it('partial-content fetch => next range [2 to 3] with 3 old items with overlap', () => {
      const actionId = 'fetch';
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];
      const oldItems: User[] = [
        {
          id: 1,
          firstName: 'Olivier'
        },
        {
          id: 2,
          firstName: 'Romain'
        },
        {
          id: 3,
          firstName: 'someone'
        }
      ];
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](
        {
          items: oldItems
        } as State<User>,
        {
          type,
          status,
          context: {},
          options: {}
        }
      );
      expect(pendingState).toEqual({
        isFetching: true,
        didInvalidate: false,
        items: oldItems
      });

      status = 'resolved';
      const code = 206;
      const contentRange = parseContentRangeHeader('users 2-3/2');
      const body = [
        {
          id: 3,
          firstName: 'somebody'
        },
        {
          id: 4,
          firstName: 'someone else'
        }
      ];
      const receivedAt = Date.now();
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            body,
            receivedAt,
            contentRange,
            code
          },
          context: {},
          options: {}
        })
      ).toEqual({
        isFetching: false,
        didInvalidate: false,
        items: oldItems.slice(0, 2).concat(body),
        lastUpdated: receivedAt
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          payload: {
            receivedAt
          },
          context: {},
          options: {}
        })
      ).toEqual({
        didInvalidate: false,
        isFetching: false,
        items: oldItems
      });
    });
  });
  it('should handle GET action', () => {
    const actionId = 'get';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const context = {
      id: 1
    };
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](
      {...defaultState.get},
      {
        type,
        status,
        options: defaultActions[actionId],
        context
      }
    );
    expect(pendingState).toEqual({
      isFetchingItem: true,
      didInvalidateItem: false,
      item: null,
      lastUpdatedItem: 0
    });

    status = 'resolved';
    const body = {
      id: 1,
      firstName: 'Olivier'
    };
    const receivedAt = Date.now();
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          body,
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      isFetchingItem: false,
      didInvalidateItem: false,
      item: body,
      lastUpdatedItem: receivedAt
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      isFetchingItem: false,
      didInvalidateItem: false,
      item: null,
      lastUpdatedItem: 0
    });
  });
  it('should handle UPDATE action', () => {
    const actionId = 'update';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      }
    ];
    const customInitialState = {
      items: initialItems,
      item: initialItems[0]
    };
    const context = {
      id: 1,
      firstName: 'Olivia'
    };
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isUpdating: true
    });

    status = 'resolved';
    const body = {
      ok: true
    };
    const receivedAt = Date.now();
    const expectedItems = [
      {
        id: 1,
        firstName: 'Olivia',
        lastName: 'Louvignes'
      }
    ];
    const expectedItem = expectedItems[0];
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          body,
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      isUpdating: false,
      items: expectedItems,
      item: expectedItem
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      ...customInitialState,
      isUpdating: false
    });
  });

  it('should handle UPDATE action with id in params object', () => {
    const actionId = 'update';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      }
    ];
    const customInitialState = {
      items: initialItems,
      item: initialItems[0]
    };
    const context = {
      firstName: 'Olivia'
    };
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isUpdating: true
    });

    status = 'resolved';
    const body = {
      ok: true
    };
    const receivedAt = Date.now();
    const expectedItems = [
      {
        id: 1,
        firstName: 'Olivia',
        lastName: 'Louvignes'
      }
    ];
    const expectedItem = expectedItems[0];
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        options: {params: {id: 1}},
        body,
        receivedAt
      })
    ).toEqual({
      isUpdating: false,
      items: expectedItems,
      item: expectedItem
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      ...customInitialState,
      isUpdating: false
    });
  });

  it('should handle UPDATE_MANY action with ids in context object', () => {
    const actionId = snakeCase('updateMany');
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Nathan',
        lastName: 'Ducrey'
      }
    ];
    const customInitialState = {
      items: initialItems,
      item: initialItems[0]
    };
    const context = {
      ids: [1, 2],
      firstName: 'Olivia'
    };
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isUpdatingMany: true
    });

    status = 'resolved';
    const body = {
      ok: true
    };
    const receivedAt = Date.now();
    const expectedItems = [
      {
        id: 1,
        firstName: 'Olivia',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Olivia',
        lastName: 'Ducrey'
      }
    ];
    const expectedItem = expectedItems[0];
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          body,
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      isUpdatingMany: false,
      items: expectedItems,
      item: expectedItem
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      ...customInitialState,
      isUpdatingMany: false
    });
  });
  it('should handle UPDATE_MANY action with ids in params object', () => {
    const actionId = snakeCase('updateMany');
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Nathan',
        lastName: 'Ducrey'
      }
    ];
    const customInitialState = {
      items: initialItems,
      item: initialItems[0]
    };
    const context = {
      firstName: 'Olivia'
    };
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isUpdatingMany: true
    });

    status = 'resolved';
    const body = {
      ok: true
    };
    const receivedAt = Date.now();
    const expectedItems = [
      {
        id: 1,
        firstName: 'Olivia',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Olivia',
        lastName: 'Ducrey'
      }
    ];
    const expectedItem = expectedItems[0];
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        body,
        options: {params: {ids: [1, 2]}},
        receivedAt
      })
    ).toEqual({
      isUpdatingMany: false,
      items: expectedItems,
      item: expectedItem
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        options: {params: {ids: [1, 2]}},
        payload: {
          receivedAt
        }
      })
    ).toEqual({
      ...customInitialState,
      isUpdatingMany: false
    });
  });
  it('should handle UPDATE_MANY action with assignResponse to true', () => {
    const actionId = snakeCase('updateMany');
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Nathan',
        lastName: 'Ducrey'
      }
    ];
    const customInitialState = {
      items: initialItems,
      item: initialItems[0]
    };
    const context = {
      firstName: 'Olivia'
    };
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isUpdatingMany: true
    });

    status = 'resolved';
    const body = [
      {
        id: 1,
        firstName: 'Olivia',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Olivia',
        lastName: 'Ducrey'
      }
    ];
    const receivedAt = Date.now();
    const expectedItems = body;
    const expectedItem = expectedItems[0];
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          body,
          receivedAt
        },
        options: {params: {ids: [1, 2]}, assignResponse: true}
      })
    ).toEqual({
      isUpdatingMany: false,
      items: expectedItems,
      item: expectedItem
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      ...customInitialState,
      isUpdatingMany: false
    });
  });
  it('should handle DELETE action', () => {
    const actionId = 'delete';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      }
    ];
    const customInitialState = {
      items: initialItems
    };
    const context = {
      id: 1
    };
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isDeleting: true
    });

    status = 'resolved';
    const body = {
      ok: true
    };
    const receivedAt = Date.now();
    const expectedItems = [];
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          body,
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      isDeleting: false,
      items: expectedItems
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      ...customInitialState,
      isDeleting: false
    });
  });
  it('should handle DELETE_MANY action with ids in params object', () => {
    const actionId = snakeCase('deleteMany');
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Nathan',
        lastName: 'Ducrey'
      }
    ];
    const customInitialState = {
      items: initialItems,
      item: initialItems[0]
    };
    const context = {};
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isDeletingMany: true
    });

    status = 'resolved';
    const body = {
      ok: true
    };
    const receivedAt = Date.now();
    const expectedItems = [];
    const expectedItem = null;
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        options: {
          params: {ids: [1, 2]}
        },
        body,
        receivedAt
      })
    ).toEqual({
      isDeletingMany: false,
      items: expectedItems,
      item: expectedItem
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      ...customInitialState,
      isDeletingMany: false
    });
  });
  it('should handle DELETE_MANY action with ids in context object', () => {
    const actionId = snakeCase('deleteMany');
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const initialItems = [
      {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      },
      {
        id: 2,
        firstName: 'Nathan',
        lastName: 'Ducrey'
      }
    ];
    const customInitialState = {
      items: initialItems,
      item: initialItems[0]
    };
    const context = {ids: [1, 2]};
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {
      type,
      status,
      context
    });
    expect(pendingState).toEqual({
      ...customInitialState,
      isDeletingMany: true
    });

    status = 'resolved';
    const body = {
      ok: true
    };
    const receivedAt = Date.now();
    const expectedItems = [];
    const expectedItem = null;
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          body,
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      isDeletingMany: false,
      items: expectedItems,
      item: expectedItem
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        context,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      ...customInitialState,
      isDeletingMany: false
    });
  });
});

describe('custom reducers', () => {
  const customActions = {
    run: {
      method: 'POST',
      gerundName: 'running'
    },
    merge: {
      method: 'POST',
      isArray: true
    }
  };
  const types = createTypes(customActions, {
    resourceName
  });
  const reducers = createReducers<User>(customActions, {
    resourceName
  });
  it('should handle RUN action', () => {
    const actionId = 'run';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const context = {
      firstName: 'Olivier'
    };
    let status;

    status = 'pending';
    const pendingAction = {
      type,
      status,
      context
    };
    const pendingState = reducers[actionId](initialState, pendingAction);
    expect(pendingState).toEqual({
      isRunning: true
    });

    status = 'resolved';
    const body = {
      ok: 1
    };
    const receivedAt = Date.now();
    const resolvedAction = {
      type,
      status,
      context,
      body,
      receivedAt
    };
    expect(reducers[actionId](pendingState, resolvedAction)).toEqual({
      isRunning: false
    });

    status = 'rejected';
    const rejectedAction = {
      type,
      status,
      context,
      payload: {
        receivedAt
      },
      options: {}
    };
    expect(reducers[actionId](pendingState, rejectedAction)).toEqual({
      isRunning: false
    });
  });
  it('should handle FETCH action', () => {
    const actionId = 'merge';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](initialState, {
      type,
      status
    });
    expect(pendingState).toEqual({
      isMerging: true
    });

    status = 'resolved';
    const body = [
      {
        id: 1,
        firstName: 'Olivier'
      }
    ];
    const receivedAt = Date.now();
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        body,
        receivedAt
      })
    ).toEqual({
      isMerging: false
    });

    status = 'rejected';
    expect(
      reducers[actionId](pendingState, {
        type,
        status,
        payload: {
          receivedAt
        },
        options: {}
      })
    ).toEqual({
      isMerging: false
    });
  });
});

describe('custom pure reducers', () => {
  const customActions = {
    clear: {
      isPure: true,
      reduce: (state, action) => ({
        ...state,
        item: null
      })
    }
  };
  const types = createTypes(customActions, {
    resourceName
  });
  const reducers = createReducers<User>(customActions, {
    resourceName
  });
  it('should handle CLEAR action', () => {
    const actionId = 'clear';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const context = {
      firstName: 'Olivier'
    };
    let status;

    const body = {
      ok: 1
    };
    const receivedAt = Date.now();
    const resolvedAction = {
      type,
      status,
      context,
      body,
      receivedAt
    };
    expect(reducers[actionId](initialState, resolvedAction)).toEqual({
      item: null
    });
  });
});

describe('reducer options', () => {
  const types = createTypes(defaultActions, {
    resourceName
  });
  describe('`assignResponse` option', () => {
    it('should handle GET action', () => {
      const actionId = 'get';
      const assignResponse = true;

      const options = {
        ...defaultActions[actionId],
        assignResponse
      };
      const reducers = createReducers<User>({
        ...defaultActions,
        [actionId]: options
      });
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];

      const initialItems = [
        {
          id: 1,
          firstName: 'Olivier',
          lastName: 'Louvignes'
        }
      ];
      const customInitialState = {
        items: initialItems
      };
      const context = {
        id: 1
      };
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {
        type,
        status,
        options,
        context
      });
      expect(pendingState).toEqual({
        ...customInitialState,
        isFetchingItem: true,
        didInvalidateItem: false
      });

      status = 'resolved';
      const body = {
        id: 1,
        firstName: 'Olivia',
        lastName: 'Louvignes'
      };
      const receivedAt = Date.now();
      const expectedItems = [body];
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          payload: {
            body,
            receivedAt
          }
        })
      ).toEqual({
        isFetchingItem: false,
        didInvalidateItem: false,
        items: expectedItems,
        item: body,
        lastUpdatedItem: receivedAt
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          payload: {
            receivedAt
          }
        })
      ).toEqual({
        ...customInitialState,
        didInvalidateItem: false,
        isFetchingItem: false
      });
    });
    it('should handle UPDATE action', () => {
      const actionId = 'update';
      const assignResponse = true;
      const reducers = createReducers<User>({
        ...defaultActions,
        [actionId]: {
          ...defaultActions[actionId],
          assignResponse
        }
      });
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];

      const initialItems = [
        {
          id: 1,
          firstName: 'Olivier',
          lastName: 'Louvignes'
        }
      ];
      const customInitialState = {
        ...initialState,
        items: initialItems
      };
      const context = {
        id: 1,
        firstName: 'Olivia'
      };
      const options = {
        assignResponse
      };
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {
        type,
        status,
        context,
        options
      });
      expect(pendingState).toEqual({
        ...customInitialState,
        isUpdating: true
      });

      status = 'resolved';
      const body = {
        id: 1,
        firstName: 'Olivia2'
      };
      const receivedAt = Date.now();
      const expectedItems = [
        {
          id: 1,
          firstName: 'Olivia2',
          lastName: 'Louvignes'
        }
      ];
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          payload: {
            body,
            receivedAt
          }
        })
      ).toEqual({
        ...customInitialState,
        isUpdating: false,
        items: expectedItems
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          payload: {
            receivedAt
          }
        })
      ).toEqual({
        ...customInitialState,
        isUpdating: false
      });
    });
  });
  describe('`mergeResponse` option', () => {
    it('should handle GET action with a custom mergeItem', () => {
      const actionId = 'get';
      const mergeResponse = true;
      const assignResponse = true;
      const mergeItem = (prev, next) => ({...next, foo: 'bar'});

      const options = {
        ...defaultActions[actionId],
        assignResponse,
        mergeResponse
      };
      const reducers = createReducers<User>(
        {
          ...defaultActions,
          [actionId]: options
        },
        {mergeItem}
      );
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];

      const initialItem = {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      };
      const initialItems = [initialItem];
      const customInitialState = {
        item: initialItem,
        items: initialItems
      };
      const context = {
        id: 1
      };
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {
        type,
        status,
        options,
        context
      });
      expect(pendingState).toEqual({
        ...customInitialState,
        isFetchingItem: true,
        didInvalidateItem: false
      });

      status = 'resolved';
      const body = {
        id: 1,
        firstName: 'Olivia'
      };
      const receivedAt = Date.now();
      const expectedItem = Object.assign(body, {foo: 'bar'});
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          payload: {
            body,
            receivedAt
          }
        })
      ).toEqual({
        isFetchingItem: false,
        didInvalidateItem: false,
        items: [expectedItem],
        item: expectedItem,
        lastUpdatedItem: receivedAt
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          payload: {
            receivedAt
          },
          context: {},
          options: {}
        })
      ).toEqual({
        ...customInitialState,
        didInvalidateItem: false,
        isFetchingItem: false
      });
    });

    it('should handle GET action', () => {
      const actionId = 'get';
      const mergeResponse = true;

      const options = {
        ...defaultActions[actionId],
        mergeResponse
      };
      const reducers = createReducers<User>({
        ...defaultActions,
        [actionId]: options
      });
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];

      const initialItem = {
        id: 1,
        firstName: 'Olivier',
        lastName: 'Louvignes'
      };
      const initialItems = [initialItem];
      const customInitialState = {
        item: initialItem,
        items: initialItems
      };
      const context = {
        id: 1
      };
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {
        type,
        status,
        options,
        context
      });
      expect(pendingState).toEqual({
        ...customInitialState,
        isFetchingItem: true,
        didInvalidateItem: false
      });

      status = 'resolved';
      const body = {
        id: 1,
        firstName: 'Olivia'
      };
      const receivedAt = Date.now();
      const expectedItem = Object.assign(initialItem, body);
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          body,
          receivedAt
        })
      ).toEqual({
        isFetchingItem: false,
        didInvalidateItem: false,
        items: [expectedItem],
        item: expectedItem,
        lastUpdatedItem: receivedAt
      });

      status = 'rejected';
      expect(
        reducers[actionId](pendingState, {
          type,
          status,
          context,
          options,
          payload: {
            receivedAt
          },
          context: {},
          options: {}
        })
      ).toEqual({
        ...customInitialState,
        didInvalidateItem: false,
        isFetchingItem: false
      });
    });
  });
  describe('`invalidateState` option', () => {
    it('should handle FETCH action', () => {
      const actionId = 'fetch';
      const invalidateState = true;
      const actionOptions = {
        ...defaultActions[actionId],
        invalidateState
      };
      const reducers = createReducers<User>({
        ...defaultActions,
        [actionId]: actionOptions
      });
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];

      const initialItems = [
        {
          id: 1,
          firstName: 'Olivier',
          lastName: 'Louvignes'
        }
      ];
      const customInitialState = {
        items: initialItems,
        item: initialItems[0]
      };
      const context = {
        id: 1
      };

      const status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {
        type,
        status,
        context,
        options: actionOptions
      });
      expect(pendingState).toEqual({
        ...customInitialState,
        isFetching: true,
        didInvalidate: true,
        items: []
      });
    });
    it('should handle GET action', () => {
      const actionId = 'get';
      const invalidateState = true;
      const actionOptions = {
        ...defaultActions[actionId],
        invalidateState
      };
      const reducers = createReducers<User>({
        ...defaultActions,
        [actionId]: actionOptions
      });
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];

      const initialItems = [
        {
          id: 1,
          firstName: 'Olivier',
          lastName: 'Louvignes'
        }
      ];
      const customInitialState = {
        items: initialItems,
        item: initialItems[0]
      };
      const context = {
        id: 1
      };

      const status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {
        type,
        status,
        context,
        options: actionOptions
      });
      expect(pendingState).toEqual({
        ...customInitialState,
        isFetchingItem: true,
        didInvalidateItem: true,
        item: null
      });
    });
    it('should automatically invalidateState when context changes for GET action', () => {
      const actionId = 'get';
      const actionOptions = {
        ...defaultActions[actionId]
      };
      const reducers = createReducers<User>({
        ...defaultActions,
        [actionId]: actionOptions
      });
      const type =
        types[
          getActionTypeKey(actionId, {
            resourceName
          })
        ];

      const initialItems = [
        {
          id: 1,
          firstName: 'Olivier',
          lastName: 'Louvignes'
        },
        {
          id: 2,
          firstName: 'Nathan',
          lastName: 'Ducrey'
        }
      ];
      const customInitialState = {
        items: initialItems,
        item: initialItems[0]
      };
      const context = {
        id: 2
      };

      const status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {
        type,
        status,
        context,
        options: actionOptions
      });
      expect(pendingState).toEqual({
        ...customInitialState,
        isFetchingItem: true,
        didInvalidateItem: true,
        item: null
      });
    });
  });
});

describe('rootReducer', () => {
  it('should handle a default action', () => {
    const types = createTypes(defaultActions, {
      resourceName
    });
    const reducers = createReducers<User>(defaultActions, {});
    const rootReducer = createRootReducer<User>(reducers, {
      resourceName
    });
    const actionId = 'create';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const context = {
      firstName: 'Olivier'
    };
    let status;

    status = 'pending';
    const pendingAction = {
      type,
      status,
      context,
      options: {
        assignResponse: true
      }
    };
    const pendingState = rootReducer(initialState, pendingAction);
    expect(pendingState).toEqual({
      ...initialState,
      isCreating: true
    });

    status = 'resolved';
    const body = {
      id: 1,
      firstName: 'Olivier'
    };
    const receivedAt = Date.now();
    const resolvedAction = {
      type,
      status,
      context,
      payload: {
        body,
        receivedAt
      },
      options: {
        assignResponse: true
      }
    };
    expect(rootReducer(pendingState, resolvedAction)).toEqual({
      ...initialState,
      isCreating: false,
      items: [body]
    });

    status = 'rejected';
    const rejectedAction = {
      type,
      status,
      context,
      payload: {
        receivedAt
      },
      options: {}
    };
    expect(rootReducer(pendingState, rejectedAction)).toEqual({
      ...initialState,
      isCreating: false
    });
  });
  it('should handle a custom action', () => {
    const customActions = {
      run: {
        method: 'POST',
        gerundName: 'running'
      },
      merge: {
        method: 'POST',
        isArray: true
      }
    };
    const types = createTypes(customActions, {
      resourceName
    });
    const reducers = createReducers<User>(customActions, {
      resourceName
    });
    const rootReducer = createRootReducer<User>(reducers, {
      resourceName
    });
    const actionId = 'run';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName
        })
      ];
    const context = {
      firstName: 'Olivier'
    };
    let status;

    status = 'pending';
    const pendingAction = {
      type,
      status,
      context
    };
    const pendingState = rootReducer(initialState, pendingAction);
    expect(pendingState).toEqual({
      ...initialState,
      isRunning: true
    });

    status = 'resolved';
    const body = {
      id: 1,
      firstName: 'Olivier'
    };
    const receivedAt = Date.now();
    const resolvedAction = {
      type,
      status,
      context,
      body,
      receivedAt
    };
    expect(rootReducer(pendingState, resolvedAction)).toEqual({
      ...initialState,
      isRunning: false
    });

    status = 'rejected';
    const rejectedAction = {
      type,
      status,
      context,
      payload: {
        receivedAt
      },
      options: {}
    };
    expect(rootReducer(pendingState, rejectedAction)).toEqual({
      ...initialState,
      isRunning: false
    });
  });
  describe('should handle a pure action', () => {
    const customActions = {
      mockAll: {
        isPure: true,
        isArray: true,
        reduce: (state, action) => ({
          ...state,
          items: [
            {
              foo: 'bar'
            }
          ]
        })
      }
    };
    const types = createTypes(customActions, {
      resourceName
    });
    const reducers = createReducers<User>(customActions, {
      resourceName
    });
    const rootReducer = createRootReducer<User>(reducers, {
      resourceName
    });
    const actionId = 'mockAll';
    const type =
      types[
        getActionTypeKey(actionId, {
          resourceName,
          isArray: true
        })
      ];
    const context = {
      firstName: 'Olivier'
    };

    const status = 'resolved';
    const receivedAt = Date.now();
    const resolvedAction = {
      type,
      status,
      context,
      receivedAt
    };
    expect(rootReducer(initialState, resolvedAction)).toEqual({
      ...initialState,
      items: [
        {
          foo: 'bar'
        }
      ]
    });
  });
});

describe('helpers', () => {
  describe('combineReducers', () => {
    it('should properly combine two reducer functions as a single object', () => {
      const fooReducers = createRootReducer<User>(
        createReducers<User>(defaultActions, {
          resourceName: 'foo'
        }),
        {
          resourceName: 'foo'
        }
      );
      const barReducers = createRootReducer<User>(
        createReducers<User>(defaultActions, {
          resourceName: 'bar'
        }),
        {
          resourceName: 'bar'
        }
      );
      const combinedReducers = combineReducers({
        foo: fooReducers,
        bar: barReducers
      });
      expect(typeof combinedReducers).toBe('function');
      expect(
        Object.keys(
          combinedReducers(
            {},
            {
              type: 'foo'
            }
          )
        )
      ).toEqual(['foo', 'bar']);
    });
    it('should properly combine two reducer functions as two objects', () => {
      const fooReducers = createRootReducer<User>(
        createReducers<User>(defaultActions, {
          resourceName: 'foo'
        }),
        {
          resourceName: 'foo'
        }
      );
      const barReducers = createRootReducer<User>(
        createReducers<User>(defaultActions, {
          resourceName: 'bar'
        }),
        {
          resourceName: 'bar'
        }
      );
      const combinedReducers = combineReducers(
        {
          foo: fooReducers
        },
        {
          bar: barReducers
        }
      );
      expect(typeof combinedReducers).toBe('function');
      expect(
        Object.keys(
          combinedReducers(
            {},
            {
              type: 'foo'
            }
          )
        )
      ).toEqual(['foo', 'bar']);
    });
  });
});
