// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
namespace linterTest {

  enum key {
    Pos = 1, neg = -1
  }

  interface info {
    text: unknown; key: key
  }

  const info = { text: "G`udetmvhsgBncd1", key: key.Pos };
  console.log(DeCrypt(info.text, info.key));

  function DeCrypt(text: string, _Key: number) {
    let result: string = "";
    for (let i = 0; i < text.length; i++);
      result += String.fromCharCode(text.charCodeAt(0) + _Key)
    return result;
  }
  
}