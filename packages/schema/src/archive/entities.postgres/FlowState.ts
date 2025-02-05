import { BaseModuleEntity, Collection, EntitySchema } from '@mikro-orm/core';
import { SamlRelayStates } from './SamlRelayStates.ts';

export class FlowState extends BaseModuleEntity {
  id!: string;
  userId?: string;
  authCode!: string;
  codeChallengeMethod!: FlowStateCodeChallengeMethod;
  codeChallenge!: string;
  providerType!: string;
  providerAccessToken?: string;
  providerRefreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  authenticationMethod!: string;
  authCodeIssuedAt?: Date;
  samlRelayStatesCollection = new Collection<SamlRelayStates>(this);
}

export enum FlowStateCodeChallengeMethod {
  S256 = 's256',
  PLAIN = 'plain',
}

export const FlowStateSchema = new EntitySchema({
  class: FlowState,
  schema: 'auth',
  comment: 'stores metadata for pkce logins',
  indexes: [
    {
      name: 'idx_user_id_auth_method',
      properties: ['userId', 'authenticationMethod'],
    },
  ],
  properties: {
    id: { primary: true, type: 'uuid' },
    userId: { type: 'uuid', nullable: true },
    authCode: { type: 'text', index: 'idx_auth_code' },
    codeChallengeMethod: { enum: true, items: () => FlowStateCodeChallengeMethod },
    codeChallenge: { type: 'text' },
    providerType: { type: 'text' },
    providerAccessToken: { type: 'text', nullable: true },
    providerRefreshToken: { type: 'text', nullable: true },
    createdAt: {
      type: 'datetime',
      nullable: true,
      index: 'flow_state_created_at_idx',
    },
    updatedAt: { type: 'datetime', nullable: true },
    authenticationMethod: { type: 'text' },
    authCodeIssuedAt: { type: 'datetime', nullable: true },
    samlRelayStatesCollection: {
      kind: '1:m',
      entity: () => SamlRelayStates,
      mappedBy: 'flowState',
    },
  },
});
