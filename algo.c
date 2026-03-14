#include <stdio.h>

int power(int x, int n){
    if(n == 0)
        return 1;
    else if(n == 1)
        return x;

    int half = power(x, n/2);

    if(n % 2 == 0)
        return half * half;
    else
        return x * half * half;
}

int main(){
    int x, n;

    printf("Enter x: ");
    scanf("%d", &x);

    printf("Enter n: ");
    scanf("%d", &n);

    printf("Result = %d", power(x, n));

    return 0;
}