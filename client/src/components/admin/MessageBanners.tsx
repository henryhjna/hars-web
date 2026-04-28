interface Props {
  error?: string;
  success?: string;
}

export default function MessageBanners({ error, success }: Props) {
  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}
    </>
  );
}
