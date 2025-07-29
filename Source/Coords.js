
class Coords
{
	constructor(x, y, z)
	{
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(other)
	{
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	clone()
	{
		return new Coords(this.x, this.y, this.z);
	}

	invert()
	{
		this.x = 0 - this.x;
		this.y = 0 - this.y;
		this.z = 0 - this.z;
		return this;
	}

	multiply(other)
	{
		this.x *= other.x;
		this.y *= other.y;
		this.z *= other.z;
		return this;
	}

	overwriteWith(other)
	{
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
		return this;
	}

	subtract(other)
	{
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}
}
