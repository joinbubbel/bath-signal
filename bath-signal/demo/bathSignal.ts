type ResCreateCall = {
  error: unknown;
  call: number;
};

type JoinQuery = {
  call: number;
  user: string;
};

type JoinQueryError = {
  type: string;
};

type ResJoinQuery = {
  error: JoinQueryError | null;
  users: string[] | null;
};

type SendOffer = {
  user: string;
  offer: string;
};

type SendOfferError = {
  type: string;
};

type ResSendOffer = {
  error: SendOfferError | null;
};

type SendAnswer = {
  user: string;
  answer: string;
};

type SendAnswerError = {
  type: string;
};

type ResSendAnswer = {
  error: SendAnswerError | null;
};

type SendICE = {
  user: string;
  ice: string;
};

type SendICEError = {
  type: string;
};

type ResSendICE = {
  error: SendICEError | null;
};

type CheckMailbox = {
  user: string;
};

type CheckMailboxError = {
  type: string;
};

type MailboxMessage = {
  ty: string;
  data: string;
};

type ResCheckMailbox = {
  error: CheckMailboxError | null;
  messages: MailboxMessage[] | null;
};
