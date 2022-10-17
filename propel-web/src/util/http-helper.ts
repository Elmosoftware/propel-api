import { Utils } from "../../../propel-shared/utils/utils";
import { HttpHeaders } from "@angular/common/http";

/**
 * Comm protocols
 */
export enum Protocol {
    HTTP = "http",
    WebSocket = "ws"
}

/**
 * API paths
 */
export enum APIPath {
    Status = "status",
    Data = "data",
    Infer = "infer",
    Run = "run",
    Security = "security"
  } 

/**
 * HTTP header representation.
 */
export type Header = { name: string, value: string | string[] }

/**
 * Standard headers used for Propel API calls.
 */
export const Headers = {
    ContentTypeJson: { name: "Content-Type", value: "application/json" },
    ContentTypeText: { name: "Content-Type", value: "text/plain" },
    XPropelNoAuth: { name: "X-Propel-NoAuth", value: "" }
}

export class HttpHelper {

    constructor() {
    }

    /**
     * Returns a well formed URL with the provided data.
     * @example
     * buildURL(Protolo.HTTP, "mysite.com", "users") => "http://mysite.com/users"
     * buildURL(Protolo.HTTP, "mysite.com", ["users", "e813377c-4428-485f-afae-748bb25463c8"]) => "http://mysite.com/users/e813377c-4428-485f-afae-748bb25463c8"
     * buildURL(Protolo.HTTP, "mysite.com", "search", new URLSearchParams({term:"tool", order: "desc"})) => "http://mysite.com/search?term=tool&order=desc"
     * @param proto HTTP Protocol
     * @param baseUrl Base URL, includes domain and optionally sub domain like "mydomain.com"
     * @param paths URL paths like "books" or ["users", "update", "12345"]
     * @param query Query string
     * @returns a wellformed URL
     */
    static buildURL(proto: Protocol | string, baseUrl: string, paths: string | string[] = "", 
        query?: URLSearchParams): string {
        
            let ret: string = "";

        if (!proto || !baseUrl) return ret;

        //Protocal plus base URL removing any trailing slashes:
        ret = `${proto.toString()}://${baseUrl.replace(/\/+$/gi, "")}`

        if (!paths) {
            paths = []
        }
        else if(!Array.isArray(paths)) {
            paths = [paths]
        }

        if (paths.length > 0) {
            ret += Utils.joinURLPath(...paths);
        }

        if(query && query.toString()) {
            ret += `?${query.toString()}`
        }

        return ret;
    }

    /**
     * Return a HTTP Headers object with all the specified headers.
     * @param headers Headers to set
     * @returns an HTTPHeaders object.
     */
    static buildHeaders(...headers: Header[]): HttpHeaders {
        let ret: HttpHeaders = new HttpHeaders()

        if (!headers) {
            headers = []
        }
        else if(!Array.isArray(headers)) {
            headers = [headers]
        }

        headers.forEach((header: Header) => {
            ret = ret.set(header.name, header.value);
        })

        return ret;
    }
}