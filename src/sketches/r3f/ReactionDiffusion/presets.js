export const presets = {
  'Dfault': { feed: 0.023, kill: 0.055 },
  'Maze': { feed: 0.033, kill: 0.063 },
  'Stripes': { feed: 0.02, kill: 0.05 },
  'Chaos-Confusion': { feed: 0.026, kill: 0.051 },
  'Plankton': { feed: 0.02, kill: 0.055 },
  'Fungal': { feed: 0.031, kill: 0.058 },
  'Angle Sprouts': { feed: 0.025, kill: 0.055 },
  'Smooth Arcs': { feed: 0.024, kill: 0.036 },
  'Spirals': { feed: 0.048, kill: 0.036 },
  'Cycling Spirals': { feed: 0.012, kill: 0.039 },
  'Spiral Puffs': { feed: 0.015, kill: 0.048 },
  'Constant Growth': { feed: 0.021, kill: 0.0539 },
  'Very Active': { feed: 0.02, kill: 0.0509 },
}

//    vec2 feedKill = vec2(uv.x*uv.y,uv.y)*vec2(.02,.06); // smoke waves
//    vec2 feedKill = vec2(.023,.053) + uv.yx*vec2(0,.01); // spots! (variations by adjusting kill)
//    vec2 feedKill = mix( vec2(.02,.04), vec2(.0,.05), uv ); // weirdsmoke
//    vec2 feedKill = mix( vec2(.03,.03), vec2(.0,.06), uv.yx ); // weirdsmoke
//    vec2 feedKill = mix( vec2(0,.04), vec2(.1,.07), uv ); // map
