declare module 'busboy' {
import { IncomingHttpHeaders } from 'http';
import { Readable, Writable } from 'stream';

interface BusboyConfig {
headers: IncomingHttpHeaders;
highWaterMark?: number;
fileHwm?: number;
defCharset?: string;
defParamCharset?: string;
preservePath?: boolean;
limits?: {
fieldNameSize?: number;
fieldSize?: number;
fields?: number;
fileSize?: number;
files?: number;
parts?: number;
headerPairs?: number;
};
}

type FileInfo = {
filename: string;
encoding: string;
mimeType: string;
};

type FieldInfo = {
nameTruncated: boolean;
valueTruncated: boolean;
encoding: string;
mimeType: string;
};

type BusboyFileStream = Readable;

interface BusboyEvents {
file: (fieldname: string, file: BusboyFileStream, info: FileInfo) => void;
field: (name: string, val: string, info: FieldInfo) => void;
partsLimit: () => void;
filesLimit: () => void;
fieldsLimit: () => void;
error: (err: Error) => void;
finish: () => void;
}

interface BusboyInstance extends Writable {
on<event extends keyof busboyevents>(event: Event, listener: BusboyEvents[Event]): this;
on(event: string, listener: (...args: any[]) => void): this; // fallback
}

export default function Busboy(config: BusboyConfig): BusboyInstance;
}