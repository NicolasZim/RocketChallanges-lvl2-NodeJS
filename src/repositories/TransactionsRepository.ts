import { uuid } from 'uuidv4';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CreateATransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface AllTransactions {
  transactions: Transaction[];
  balance: Balance;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): AllTransactions {
    return {
      transactions: this.transactions,
      balance: this.getBalance(),
    };
  }

  public getBalance(): Balance {
    const incomeTotal = this.transactions
      .map(obj => {
        if (obj.type === 'income') {
          return obj.value;
        }
        return 0;
      })
      .reduce((current, total) => current + total, 0);

    const outcomeTotal = this.transactions
      .map(obj => {
        if (obj.type === 'outcome') {
          return obj.value;
        }
        return 0;
      })
      .reduce((current, total) => current + total, 0);
    // in the end of the line i'm using 'total ,0);'
    // for set zero if array it's empty -> reduce((current, total) => current + total, 0);

    return {
      income: incomeTotal,
      outcome: outcomeTotal,
      total: incomeTotal - outcomeTotal,
    };
  }

  public create({ title, value, type }: CreateATransactionDTO): Transaction {
    // TODO: Throw Error if balance.income - balance.outcome - newOutcome result in negative value
    if (type === 'outcome') {
      const balance = this.getBalance();
      const outcomeIsValid = balance.income - (balance.outcome + (value || 0));
      if (outcomeIsValid <= 0) {
        throw Error("You don't have income resources for this outcomne.");
      }
    } else if (type !== 'income' && type !== 'outcome') {
      throw Error(`Transaction 'type' unrecognized.`);
    }

    const newTransaction = {
      id: uuid(),
      title,
      value,
      type,
    };
    this.transactions.push(newTransaction);

    return newTransaction;
  }
}

export default TransactionsRepository;
