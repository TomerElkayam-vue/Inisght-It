export type JiraAvatarUrls = {
  '48x48': string;
  '24x24': string;
  '16x16': string;
  '32x32': string;
};

export type JiraUserDto = {
  self: string;
  accountId: string;
  avatarUrls: JiraAvatarUrls;
  displayName: string;
  active: boolean;
  timeZone: string;
  accountType: string;
};
