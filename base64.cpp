#include <string>
 
/* 预置编码模版*/
constexpr char BASE16_ENCODE_TABLE[16 + 1] = "0123456789ABCDEF";
constexpr char BASE32_ENCODE_TABLE[32 + 1] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
constexpr char BASE64_ENCODE_TABLE[64 + 1] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
 
/* 预置解码模版 */
constexpr char BASE16_DECODE_TABLE[256] =
{ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,0,0,0,0,0,0,0,10,11,12,13,14,15,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0 };
 
constexpr char BASE32_DECODE_TABLE[256] = 
{ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,27,28,29,30,31,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,
7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0 };
 
constexpr char BASE64_DECODE_TABLE[256] = 
{ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,62,0,0,0,63,52,53,54,55,56,57,58,59,60,61,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,
10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,0,0,0,0,0,0,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
41,42,43,44,45,46,47,48,49,50,51,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 };
 
 
// 返回一个256大小的解码表
std::string GenDecodeTable(const std::string& strEncodeTable); 
std::string GenDecodeTable(const std::string& strEncodeTable)
{
    using namespace std;
    string strResult;
    auto nSize = strEncodeTable.size();
    if (nSize == 0)
        return strResult;
 
    strResult.assign(256, -1);
    for (size_t i = 0; i < nSize; ++i)
        strResult[strEncodeTable[i]] = (char)i;
 
    return strResult;
}




#include <string>
#include <stdexcept>
 
std::string EncodeBase64(const std::string& strInput, const std::string& strTable= "", const char& padSymble = '=');
std::string EncodeBase64(const std::string& strInput, const std::string& strTable, const char& padSymble)
{ 
    using namespace std;
    typedef unsigned int uint;
 
    string strOutput;
    auto E_Table = BASE64_ENCODE_TABLE;
    auto nSize = strInput.size();
    if (nSize == 0) {
        return strOutput;
    }
    if (strTable.size()) {
        if (strTable.size() < 64)
            throw std::runtime_error("BASE64 Format Error: encode table at least 64 bytes  ");
        E_Table = strTable.c_str();
    }
    auto nBlockSize = (nSize + 2) / 3 * 4;
    if (nBlockSize < nSize)
        throw std::runtime_error("BASE64 Length Overflow: output length over maximum of size_t");
 
    strOutput.resize(nBlockSize, '\0');
    auto pInput = (const unsigned char*)strInput.c_str();
    auto pOutput = (unsigned char*)&strOutput[0];
    auto nLeft = nSize % 3;
    auto nLast = nSize - nLeft;
    for (auto pEnd = pInput + nLast; pInput < pEnd; pInput += 3) {
        // 3bytes - 24bit
        uint n = pInput[0] << 16 | pInput[1] << 8 | pInput[2];
        // 每6bit为一个编码, 0x3F为遮罩, 表示取后6bit(位运算)
        *pOutput = E_Table[n >> 18];          
        *++pOutput = E_Table[n >> 12 & 0x3F];  
        *++pOutput = E_Table[n >> 6 & 0x3F];   
        *++pOutput = E_Table[n & 0x3F];       
        ++pOutput;
    }
 
    
    // BASE64 编码时, 每3个字节的数据编入4个BASE64编码, 因此不成组的情况只有以下两种
    switch (nLeft)
    {
    case 1:
    {// 1存2
        *pOutput = E_Table[(pInput[0] >> 2)];             // [0]前6bit
        *++pOutput = E_Table[((pInput[0] & 0x03) << 4)];  // [0]后2bit 0x03是遮罩 0000 0111, 其他同理
        *++pOutput = padSymble;
        *++pOutput = padSymble;
        break;
    }
    case 2:
    {// 2存3
        *pOutput = E_Table[(pInput[0] >> 2)]; // [0]前6bit
        *++pOutput = E_Table[((pInput[0] & 0x03) << 4) | (pInput[1] >> 4)]; // [0]前2bit和[1]前4bit
        *++pOutput = E_Table[((pInput[1] & 0x0F) << 2)]; // [1]后4bit
        *++pOutput = padSymble;
        break;
    }
    default:
        break;
    }
 
    return strOutput;
}





#include <string>
#include <stdexcept>
 
std::string DecodeBase64(const std::string& strInput, const std::string& strTable = "", const char& padSymble = '=');
std::string DecodeBase64(const std::string& strInput, const std::string& strTable, const char& padSymble)
{
    using namespace std;
    typedef unsigned int uint;
   
    string strOutput;
    auto D_Table = BASE64_DECODE_TABLE;
    auto nSize = strInput.size();
    if (nSize == 0) {
        return strOutput;
    }
    if (strTable.size()) {
        if (strTable.size() != 256)
            throw std::runtime_error("BASE32 format error, decode table size is not 256 bytes ");
        D_Table = strTable.c_str();
    }
 
    // 针对长度不满足4的倍数的残码的处理
    auto pInput = (const unsigned char*)strInput.c_str();
    bool bPad = nSize % 4 || pInput[nSize - 1] == padSymble; // 确定是否有填充
    size_t nLast = (nSize - (size_t)bPad) / 4 << 2; // 有填充则抛弃最后一组取整, 最后一组单独处理
    size_t nLeftCode = nSize - nLast;
    // 有效数据与BASE64对应关系, BASE64有填充的情况只可能是多出1-2个实际有效数据(可以根据BASE64定义去画表格理解)
    size_t nLeftData = 0;
    nLeftData += nLeftCode > 1 && pInput[nLast + 1] != padSymble;// 是否多出1个有效数据
    nLeftData += nLeftData && nLeftCode > 2 && pInput[nLast + 2] != padSymble;// 是否多出2个有效数据
    strOutput.resize(nLast / 4 * 3 + nLeftData, '\0'); 
    
    // 将4字节BASE编码的有效数据塞入到3个字节中存储, 占据24bit  
    auto pOutput = (unsigned char*)&strOutput[0];
    for (auto pEnd = pInput + nLast; pInput < pEnd; pInput += 4) 
    {
        uint n =
            BASE64_DECODE_TABLE[pInput[0]] << 18 |
            BASE64_DECODE_TABLE[pInput[1]] << 12 |
            BASE64_DECODE_TABLE[pInput[2]] << 6 |
            BASE64_DECODE_TABLE[pInput[3]];
 
        *pOutput = n >> 16;         // 前8字节没有数据
        *++pOutput = n >> 8 & 0xFF; // 0xFF为取后8bit
        *++pOutput = n & 0xFF;
        ++pOutput;
    }
 
    // 有效数据与BASE64对应关系(每个BASE64编码只有后6个bit有效, 在编码的时候就是这样定义的)
    switch (nLeftData)
    {
    case 1:
    {// 2写1
        *pOutput = D_Table[pInput[0]] << 2 | D_Table[pInput[1]] >> 4; // [0]后6bit + [1]前2bit
        break;
    }
    case 2:
    {// 3写2
        *pOutput = D_Table[pInput[0]] << 2 | D_Table[pInput[1]] >> 4; // [0]后6bit + [1]前2bit
        *++pOutput = D_Table[pInput[1]] << 4 | D_Table[pInput[2]] >> 2;// [1]后4bit + [2]前4bit
        break;
    }
    }
 
    return strOutput;
}


