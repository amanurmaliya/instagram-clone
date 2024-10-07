#include<bits/stdc++.h>
using namespace std;

struct info
{
    int open = 0;
    int close = 0;
    int full = 0;
};

info merge(info left, info right)
{
    info node;
    node.full = left.full + right.full + min(left.open, right.close);
    node.open = left.open + right.open - min(left.open, right.close);
    node.close = left.close + right.close - min(left.open, right.close);
    return node;
}

void build(int idx, int low, int high,string s, info seg[])
{
    if(low==high)
    {
        seg[idx].open = s[low]=='(';
        seg[idx].close = s[low]==')';
        seg[idx].full = 0;
        return ;
    }

    int mid = (low+high)/2;
    build(2*idx+1, low, mid, s, seg);
    build(2*idx+2, mid+1, high, s, seg);

    seg[idx] = merge(seg[2*idx+1], seg[2*idx+2]);
}

info query(int idx, int low, int high, int left, int right, info seg[])
{
    // no over lap
    // left = 3 right = 5 
    // low = 0, high = 2 high<left
    // low = 6, high = 8 low>right
    if(high <left || low>right) 
    {
         info a;
        return a;
    }
    // condition full overlap
    if(low>=left && high <= right) 
    {
        return seg[idx];
    }

    // partial overlap
    int mid = (low+high)>>1;
    info l = query(2*idx+1, low, mid, left, right, seg);
    info r = query(2*idx+2, mid+1, high, left, right, seg);

    return merge(l, r);
}
int main()
{
    string s;
    cin>>s;

    int n = s.size();
    info seg[4*n+1];

    build(0, 0, n-1, s, seg);

    int t;
    cin>>t;

    while(t--)
    {
        int left, right;
        cin>>left>>right;

        cout<<query(0, 0, n-1, left-1, right-1, seg).full * 2<<endl;

    }
}