export interface SandboxConfig {
  allowScripts: boolean;
  allowSameOrigin: boolean;
}

export interface SandboxMessage {
  type: 'EXECUTE';
  code: string;
  envMode?: 'dom' | 'p5';
}