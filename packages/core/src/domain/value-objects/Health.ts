interface HealthProps {
  value: number;
}

export class Health {
  private constructor(private readonly props: HealthProps) { }

  public static create(value: number): Health {
    if (value < 0 || value > 100) {
      throw new Error("Health must be between 0 and 100");
    }
    return new Health({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
