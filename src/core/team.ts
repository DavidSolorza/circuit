export interface TeamMember {
  name: string;
  role: string;
}

/** Equipo de desarrollo de Electro+ Lab */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Miguel Angel Alvarez Ramirez',
    role: 'Editor visual, store y conexiones',
  },
  {
    name: 'Luisa Fernanda Ibarra Tucano',
    role: 'Motor de simulación MNA y backend',
  },
  {
    name: 'David Josué Solorza Viera',
    role: 'UI/UX, documentación y despliegue',
  },
];

export const TEAM_LABEL = TEAM_MEMBERS.map((m) => m.name).join(' · ');
