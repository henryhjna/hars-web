export default function About() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            About Hanyang Accounting Research Symposium
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Fostering excellence in accounting research since its inception
          </p>
        </div>
        <div className="mt-12 max-w-prose mx-auto text-gray-500">
          <p className="text-lg">
            The Hanyang Accounting Research Symposium (HARS) is a premier academic
            event that brings together researchers, faculty, and practitioners in the
            field of accounting. Our mission is to promote rigorous academic research
            and facilitate knowledge exchange among the accounting community.
          </p>
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
              <p className="mt-2">
                To advance accounting research and education by providing a platform
                for researchers to share their work, receive feedback, and engage in
                meaningful discussions with peers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">What We Offer</h3>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>Paper submission and peer review process</li>
                <li>Annual symposium with keynote speakers</li>
                <li>Networking opportunities with leading researchers</li>
                <li>Best paper awards and recognition</li>
                <li>Publication opportunities in partner journals</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
              <p className="mt-2">
                For inquiries about the symposium, please contact us at:{' '}
                <a
                  href="mailto:info@hanyanghars.com"
                  className="text-primary-600 hover:text-primary-500"
                >
                  info@hanyanghars.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
