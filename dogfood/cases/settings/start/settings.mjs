export function settings(defaults, project, user) {
  return { ...defaults, ...project, ...user };
}
