import StandardLayout from "@/components/layouts/standard/standard-layout";
import SystemArchirecture from "./system-architecture.png";
import Image from "next/image";

export default async function Home() {
  return (
    <StandardLayout>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="grid grid-cols-2 w-full gap-4">
          <div>
            <p>
              This system includes four components: the SFUs, the Broker, the Socket Handler, and the Web Application.
            </p>            
            <ol className="list-decimal list-inside">
              <li>The <b>SFUs</b> (Selective Forwarding Units) manage the logic of meetings and their attendees in the media plane.</li>
              <li>The <b>Broker</b> works similarly to a reversed proxy: it selectively picks an SFU for instantiating a meeting and forwards each command to the appropriate SFU.</li>
              <li>The <b>Socket Handler</b> handles the connections of attendees in each meeting. It also acts as an instant messaging service that notifies attendees about events that have taken place.</li>
              <li>The <b>Web Application</b> is an interactive web application that users use to start and join video conferences.</li>
            </ol>
            <br />

            <p>
              Currently, we choose <a href="https://mediasoup.org/" className="underline">mediasoup</a> to implement the SFUs because of its performance, signaling agnostic, scalability, and working seamlessly on many operating systems.
            </p>
            <br />

            <p>
              The Broker maintains an in-memory hash map storing information about each meeting and its corresponding SFU&apos;s address. For simplicity, we adopt the round-robin algorithm to select an SFU for a new meeting.
            </p>
            <br />

            <p>
              We use <a href="https://nextjs.org/" className="underline">Next.js</a> for the Web Application and <a href="https://socket.io/" className="underline">socket.io</a> for the Socket Handler. Because the application logic other than the media itself is relatively small, we decided to put all the application logic into the Socket Handler.
              For complex scenarios, we suggest separating the application logic into another server.
            </p>
            <br />

            <p>
              Most of the communication methods used in the system are synchronous. There are still some cases when the SFUs want to notify attendees to perform appropriate actions on local machines, which requires a communication channel between the SFUs and the Socket Handler. We decided to utilize <a href="https://redis.io/" className="underline">Redis</a> because of its simplicity, reliability, and low latency.
            </p>
            <br />

            <p>
              The system can be horizontally scalable in the following ways:
              <ol className="list-decimal list-inside">
                <li>Move the in-memory map to a remote storage service to make the Broker stateless.</li>
                <li>Adapt Redis backplane to the Socket Handler.</li>
                <li>The Next.js Web Application is naturally horizontally scalable.</li>
              </ol>
            </p>
          </div>
          <div>
            <Image alt="Overall system architecture" src={SystemArchirecture} priority={false} />
          </div>
        </div>
      </main>
    </StandardLayout>
  );
}
