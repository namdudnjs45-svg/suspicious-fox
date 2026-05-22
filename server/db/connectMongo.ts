import mongoose from "mongoose";

declare global {
  /** 개발 중 핫 리로드 시 재연결 스팸 방지 */
  var __mongooseFoxConn: typeof mongoose | undefined;
}

export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri?.trim()) {
    throw new Error("[server] MONGODB_URI 환경 변수가 필요합니다.");
  }

  mongoose.set("strictQuery", false);

  if (global.__mongooseFoxConn?.connection?.readyState === 1) {
    return global.__mongooseFoxConn;
  }

  const conn = await mongoose.connect(uri);
  global.__mongooseFoxConn = conn;
  return conn;
}
