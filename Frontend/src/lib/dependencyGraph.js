export function parseFormulaVariables(formula) {
  if (!formula) return [];
  const regex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  const matches = formula.match(regex) || [];
  const builtins = new Set(['Math', 'min', 'max', 'round', 'floor', 'ceil', 'abs', 'if', 'else', 'true', 'false']);
  return [...new Set(matches)].filter(m => !builtins.has(m) && m.toUpperCase() === m);
}

export function buildDependencyGraph(rules) {
  const graph = {};
  rules.forEach(rule => {
    graph[rule.code] = parseFormulaVariables(rule.formula || rule.condition);
  });
  return graph;
}

export function topologicalSort(graph) {
  const inDegree = {};
  const adjList = {};
  
  Object.keys(graph).forEach(node => {
    inDegree[node] = 0;
    adjList[node] = [];
  });
  
  Object.entries(graph).forEach(([node, deps]) => {
    deps.forEach(dep => {
      if (adjList[dep]) {
        adjList[dep].push(node);
        inDegree[node] = (inDegree[node] || 0) + 1;
      }
    });
  });
  
  const queue = [];
  Object.keys(inDegree).forEach(node => {
    if (inDegree[node] === 0) queue.push(node);
  });
  
  const order = [];
  while (queue.length) {
    const curr = queue.shift();
    order.push(curr);
    
    adjList[curr]?.forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  const hasCycle = order.length !== Object.keys(graph).length;
  let cycle = [];
  if (hasCycle) {
    cycle = detectCycles(graph)[0] || [];
  }
  
  return { order, hasCycle, cycle };
}

export function detectCycles(graph) {
  const visited = {};
  const recStack = {};
  const cycles = [];
  
  function dfs(node, path) {
    if (recStack[node]) {
      cycles.push([...path, node]);
      return true;
    }
    if (visited[node]) return false;
    
    visited[node] = true;
    recStack[node] = true;
    path.push(node);
    
    const deps = graph[node] || [];
    for (const dep of deps) {
      if (graph[dep]) {
        dfs(dep, path);
      }
    }
    
    recStack[node] = false;
    path.pop();
    return false;
  }
  
  Object.keys(graph).forEach(node => {
    if (!visited[node]) {
      dfs(node, []);
    }
  });
  
  return cycles;
}

export function getExecutionOrder(rules) {
  const graph = buildDependencyGraph(rules);
  return topologicalSort(graph);
}
