export const loginStrings = {
  title: 'Welcome',
  subtitle: 'Sign in to continue tracking your money.',
  email: 'E-mail address',
  password: 'Password',
  enter: 'Sign in',
  loginError: 'Invalid credentials',
  switchPrompt: "Don't have an account?",
  switchCta: 'Create one',
  orSeparator: 'or',
  googleSignIn: 'Continue with Google',
  githubSignIn: 'Continue with GitHub',
};

export const registerStrings = {
  title: 'Create your\naccount',
  subtitle: 'A few details and you are in.',
  email: 'E-mail address',
  password: 'Password',
  confirmPassword: 'Confirm password',
  passwordHint:
    'Use at least 14 characters mixing letters, numbers and symbols.',
  submit: 'Create account',
  registerError: 'Could not create your account',
  switchPrompt: 'Already have an account?',
  switchCta: 'Sign in',
};

export const homeStrings = {
  totalBalance: 'Total balance',
  allYears: 'All',
  incomeVsExpenses: 'Income vs expenses',
  income: 'Income',
  expenses: 'Expenses',
  transferHistory: 'Reports history',
  seeAll: 'View details',
  operations: 'operations',
  emptyTitle: 'No reports yet',
  emptySubtitle: 'Upload your first report from the Upload tab.',
};

export const profileStrings = {
  title: 'Profile',
  memberSince: 'Member since',
  photoUploadSoon: 'Profile photo upload coming soon',
  sectionAccount: 'Account',
  sectionWallets: 'Wallets',
  sectionDanger: 'Danger zone',
  username: 'Username',
  changePassword: 'Change password',
  wallets: 'Wallets',
  wallet: 'wallet',
  walletsPlural: 'wallets',
  logout: 'Log out',
  deleteAccount: 'Delete account',
};

export const deleteAccountStrings = {
  title: 'Delete account',
  body:
    'This permanently deletes your account, reports, operations, and tracked wallets. This cannot be undone.',
  cancel: 'Cancel',
  confirm: 'Delete',
};

export const walletsSettingsStrings = {
  title: 'Wallets',
  addTitle: 'Add wallet',
  detailTitle: 'Wallet',
  xpubLabel: 'Extended public key (xpub)',
  xpubPlaceholder: 'xpub6C…',
  helper:
    "We use this read-only key to fetch your wallet's balance and transactions from Blockstream. Your funds stay safe.",
  submit: 'Add wallet',
  emptyTitle: 'No wallets yet',
  emptySubtitle:
    'Add your first wallet to track its balance and transactions.',
  copy: 'Copy',
  copied: 'Copied',
  viewInCrypto: 'View in Crypto',
  deleteWallet: 'Delete wallet',
  deleteWalletPrompt: 'Delete wallet?',
  deleteWalletBody: 'This removes it from tracking; no funds are moved.',
  cancel: 'Cancel',
  confirm: 'Delete',
  requiredXpub: 'Extended public key is required',
};

export const changePasswordStrings = {
  title: 'Change password',
  current: 'Current password',
  new: 'New password',
  confirm: 'Confirm new password',
  hint: 'Use at least 14 characters mixing letters, numbers and symbols.',
  submit: 'Update password',
  success: 'Password updated',
};

export const changeUsernameStrings = {
  title: 'Username',
  label: 'Username',
  submit: 'Save',
  success: 'Username updated',
  requiredUsername: 'Username is required',
  invalidUsername: 'Username must be at least 3 characters',
};

export const reportStrings = {
  income: 'Income',
  expenses: 'Expenses',
  balance: 'Balance',
  transactions: 'Transactions',
  noTransactions: 'No transactions in this report.',
};

export const categoriesStrings = {
  title: 'Categories',
  allYears: 'All',
  totalExpenses: 'Total expenses',
  breakdown: 'Breakdown',
  operations: 'operations',
  operation: 'operation',
  emptyTitle: 'No expenses yet',
  emptySubtitle: 'Once you upload reports with outgoing operations, the breakdown will show up here.',
};

export const categoryDetailStrings = {
  totalSpent: 'Total spent',
  operations: 'operations',
  operation: 'operation',
  average: 'Average',
  ofTotal: 'Of total',
  period: 'Period',
  empty: 'No operations in this category.',
};

export const cryptoTxDetailStrings = {
  title: 'Transaction',
  type: 'Type',
  date: 'Date',
  amount: 'Amount',
  fee: 'Fee',
  status: 'Status',
  from: 'From',
  to: 'To',
  reference: 'Reference',
};

export const cryptoStrings = {
  title: 'Crypto',
  currentBalance: 'Current balance',
  received: 'Income',
  sent: 'Expense',
  transactions: 'Transactions',
  walletEvolution: 'Wallet balance evolution',
  btcPrice: 'BTC price (EUR)',
  btcPriceComingSoon: 'BTC price feed coming soon.',
  allYearsLabel: 'All',
  confirmed: 'Confirmed',
  pending: 'Pending',
  internal: 'Internal',
  net: 'Net',
  txs: 'txs',
  ops: 'operations',
  emptyTitle: 'No wallets tracked',
  emptySubtitle:
    'Add a wallet via the API to see its live balance, transactions and BTC evolution here.',
  noTransactions: 'No transactions in this period.',
  fees: 'Fees',
  largest: 'Largest',
};

export const reportsListStrings = {
  title: 'Reports',
  allYears: 'All',
  evolution: 'Balance evolution',
  emptyTitle: 'No reports yet',
  emptySubtitle: 'Upload one to see the evolution of your balance.',
};

export const transactionStrings = {
  title: 'Transaction info',
  type: 'Type',
  concept: 'Concept',
  date: 'Date',
  amount: 'Amount',
  category: 'Category',
  reference: 'Reference',
  income: 'Income',
  expense: 'Expense',
  save: 'Save',
  pickCategory: 'Select a category',
  saveError: 'Could not update the category',
};

export const verifyStrings = {
  title: 'Check your email',
  subtitle: 'We sent a 6-digit code to',
  label: 'Verification code',
  submit: 'Verify',
  resendPrompt: "Didn't get the code?",
  resendCta: 'Resend',
  resendSent: 'Code sent',
  changeEmail: 'Use a different email',
  verifyError: 'Invalid or expired code',
  successBanner: 'Email verified. You can sign in now.',
};

export const validationStrings = {
  requiredEmail: 'E-mail address is required',
  invalidEmail: 'E-mail address is invalid',
  requiredPassword: 'Password is required',
  invalidPassword: 'Password must be at least 14 characters',
  repeatedCharacters: 'Password cannot contain repeated characters',
  requiredConfirmPassword: 'Please confirm your password',
  passwordMismatch: 'Passwords do not match',
  requiredCode: 'Verification code is required',
  invalidCodeLength: 'Code must be 6 digits',
};
